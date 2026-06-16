import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type LlmChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

@Injectable()
export class LlmService {
  constructor(private readonly configService: ConfigService) {}

  isConfigured() {
    return Boolean(this.configService.get<string>('LLM_API_KEY'));
  }

  async complete(messages: LlmChatMessage[]) {
    const apiKey = this.configService.get<string>('LLM_API_KEY');

    if (!apiKey) {
      return undefined;
    }

    const baseUrl = this.trimTrailingSlash(
      this.configService.get<string>('LLM_BASE_URL') ??
        'https://api.openai.com/v1',
    );
    const model =
      this.configService.get<string>('LLM_MODEL') ?? 'gpt-4o-mini';
    const temperature = Number(
      this.configService.get<string>('LLM_TEMPERATURE') ?? 0.45,
    );
    const maxTokens = Number(
      this.configService.get<string>('LLM_MAX_TOKENS') ?? 900,
    );

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`LLM request failed: ${response.status} ${body}`);
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    return json.choices?.[0]?.message?.content?.trim();
  }

  private trimTrailingSlash(value: string) {
    return value.replace(/\/+$/, '');
  }
}
