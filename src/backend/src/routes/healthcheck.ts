import type { FastifyInstance } from 'fastify'

export async function healthcheckRoute(app: FastifyInstance) {
  app.get('/healthcheck', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
}
