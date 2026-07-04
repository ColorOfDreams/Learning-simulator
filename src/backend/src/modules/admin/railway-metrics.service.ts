import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TimeRange = '1h' | '6h' | '1d' | '7d' | '30d';

export interface Sample {
  ts: number;
  value: number;
}

const RAILWAY_ENDPOINT = 'https://backboard.railway.com/graphql/v2';

const RESOURCE_METRICS_QUERY = `
  query($environmentId: String!, $serviceId: String!, $startDate: DateTime!, $endDate: DateTime!, $measurements: [MetricMeasurement!]!, $sampleRateSeconds: Int) {
    metrics(environmentId: $environmentId, serviceId: $serviceId, startDate: $startDate, endDate: $endDate, measurements: $measurements, sampleRateSeconds: $sampleRateSeconds) {
      measurement
      values { ts value }
    }
  }
`;

const HTTP_METRICS_QUERY = `
  query($environmentId: String!, $serviceId: String!, $startDate: DateTime!, $endDate: DateTime!, $stepSeconds: Int) {
    httpMetrics(environmentId: $environmentId, serviceId: $serviceId, startDate: $startDate, endDate: $endDate, stepSeconds: $stepSeconds) {
      samples { ts value }
    }
  }
`;

const HTTP_METRICS_BY_STATUS_QUERY = `
  query($environmentId: String!, $serviceId: String!, $startDate: DateTime!, $endDate: DateTime!, $stepSeconds: Int) {
    httpMetricsGroupedByStatus(environmentId: $environmentId, serviceId: $serviceId, startDate: $startDate, endDate: $endDate, stepSeconds: $stepSeconds) {
      statusCode
      samples { ts value }
    }
  }
`;

const HTTP_DURATION_QUERY = `
  query($environmentId: String!, $serviceId: String!, $startDate: DateTime!, $endDate: DateTime!, $stepSeconds: Int) {
    httpDurationMetrics(environmentId: $environmentId, serviceId: $serviceId, startDate: $startDate, endDate: $endDate, stepSeconds: $stepSeconds) {
      samples { ts p50 p90 p95 p99 }
    }
  }
`;

const RANGE_WINDOWS: Record<TimeRange, { ms: number; stepSeconds: number }> = {
  '1h': { ms: 3600e3, stepSeconds: 60 },
  '6h': { ms: 6 * 3600e3, stepSeconds: 300 },
  '1d': { ms: 24 * 3600e3, stepSeconds: 3600 },
  '7d': { ms: 7 * 24 * 3600e3, stepSeconds: 21600 },
  '30d': { ms: 30 * 24 * 3600e3, stepSeconds: 86400 },
};

@Injectable()
export class RailwayMetricsService {
  private readonly logger = new Logger(RailwayMetricsService.name);

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.token && this.environmentId && this.serviceId);
  }

  private get token() {
    return this.configService.get<string>('RAILWAY_API_TOKEN');
  }

  private get environmentId() {
    return this.configService.get<string>('RAILWAY_ENVIRONMENT_ID');
  }

  private get serviceId() {
    return this.configService.get<string>('RAILWAY_BACKEND_SERVICE_ID');
  }

  private async gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const res = await fetch(RAILWAY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Project-Access-Token': this.token as string,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors?.length) {
      throw new Error(json.errors.map((e: { message: string }) => e.message).join('; '));
    }
    return json.data as T;
  }

  private window(range: TimeRange) {
    const cfg = RANGE_WINDOWS[range] ?? RANGE_WINDOWS['1d'];
    const now = Date.now();
    return {
      startDate: new Date(now - cfg.ms).toISOString(),
      endDate: new Date(now).toISOString(),
      stepSeconds: cfg.stepSeconds,
    };
  }

  async getBackendMetrics(range: TimeRange = '1d') {
    if (!this.isConfigured()) {
      return { configured: false as const };
    }

    const environmentId = this.environmentId as string;
    const serviceId = this.serviceId as string;
    const { startDate, endDate, stepSeconds } = this.window(range);

    const [resource, requests, requestsByStatus, duration] = await Promise.all([
      this.gql<{ metrics: { measurement: string; values: Sample[] }[] }>(RESOURCE_METRICS_QUERY, {
        environmentId,
        serviceId,
        startDate,
        endDate,
        measurements: ['CPU_USAGE', 'MEMORY_USAGE_GB', 'NETWORK_RX_GB', 'NETWORK_TX_GB'],
        sampleRateSeconds: stepSeconds,
      }).catch((err) => {
        this.logger.warn(`Railway resource metrics failed: ${String(err)}`);
        return null;
      }),
      this.gql<{ httpMetrics: { samples: Sample[] } }>(HTTP_METRICS_QUERY, {
        environmentId,
        serviceId,
        startDate,
        endDate,
        stepSeconds,
      }).catch((err) => {
        this.logger.warn(`Railway httpMetrics failed: ${String(err)}`);
        return null;
      }),
      this.gql<{ httpMetricsGroupedByStatus: { statusCode: number; samples: Sample[] }[] }>(
        HTTP_METRICS_BY_STATUS_QUERY,
        { environmentId, serviceId, startDate, endDate, stepSeconds },
      ).catch((err) => {
        this.logger.warn(`Railway httpMetricsGroupedByStatus failed: ${String(err)}`);
        return null;
      }),
      this.gql<{ httpDurationMetrics: { samples: (Sample & { p50: number; p90: number; p95: number; p99: number })[] } }>(
        HTTP_DURATION_QUERY,
        { environmentId, serviceId, startDate, endDate, stepSeconds },
      ).catch((err) => {
        this.logger.warn(`Railway httpDurationMetrics failed: ${String(err)}`);
        return null;
      }),
    ]);

    const byMeasurement = (name: string) =>
      resource?.metrics?.find((m) => m.measurement === name)?.values ?? [];

    const requestSamples = requests?.httpMetrics?.samples ?? [];
    const totalRequests = requestSamples.reduce((sum, s) => sum + s.value, 0);

    const byStatus = requestsByStatus?.httpMetricsGroupedByStatus ?? [];
    const errorTrendMap = new Map<number, { total: number; error: number }>();
    let successCount = 0;
    let errorCount = 0;
    for (const group of byStatus) {
      const isError = group.statusCode >= 400;
      for (const sample of group.samples) {
        const bucket = errorTrendMap.get(sample.ts) ?? { total: 0, error: 0 };
        bucket.total += sample.value;
        if (isError) bucket.error += sample.value;
        errorTrendMap.set(sample.ts, bucket);
        if (isError) errorCount += sample.value;
        else successCount += sample.value;
      }
    }
    const totalForRate = successCount + errorCount;
    const errorRatePercent = totalForRate > 0 ? (errorCount / totalForRate) * 100 : 0;
    const errorRateTrend = Array.from(errorTrendMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([ts, v]) => ({ ts, value: v.total > 0 ? Number(((v.error / v.total) * 100).toFixed(2)) : 0 }));

    const notSupported: string[] = [];
    if (!resource) notSupported.push('cpu', 'memory', 'network');
    if (!requests) notSupported.push('requests');
    if (!requestsByStatus) notSupported.push('errorRate');
    if (!duration) notSupported.push('responseTime');

    return {
      configured: true as const,
      range,
      cpu: byMeasurement('CPU_USAGE'),
      memory: byMeasurement('MEMORY_USAGE_GB'),
      networkRx: byMeasurement('NETWORK_RX_GB'),
      networkTx: byMeasurement('NETWORK_TX_GB'),
      requests: { total: Math.round(totalRequests), trend: requestSamples },
      errorRate: { percent: Number(errorRatePercent.toFixed(2)), trend: errorRateTrend },
      responseTime: { trend: duration?.httpDurationMetrics?.samples ?? [] },
      notSupported,
    };
  }
}
