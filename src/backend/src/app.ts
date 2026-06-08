import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import sensible from '@fastify/sensible'
import rateLimit from '@fastify/rate-limit'

import { healthcheckRoute } from './routes/healthcheck.js'
import { analyzeRoute } from './routes/analyze.js'
import { explainRoute } from './routes/explain.js'
import { quizRoute } from './routes/quiz.js'
import { libraryRoute } from './routes/library.js'
import { historyRoute } from './routes/history.js'
import { sessionsRoute } from './routes/sessions.js'
import { authRoute } from './routes/auth.js'

export async function buildApp() {
  const app = Fastify({ logger: true })

  await app.register(cors, { origin: process.env.FRONTEND_URL ?? '*' })
  await app.register(sensible)
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })
  await app.register(jwt, { secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-prod' })

  app.register(healthcheckRoute, { prefix: '/api/v1' })
  app.register(analyzeRoute, { prefix: '/api/v1' })
  app.register(explainRoute, { prefix: '/api/v1' })
  app.register(quizRoute, { prefix: '/api/v1' })
  app.register(libraryRoute, { prefix: '/api/v1' })
  app.register(historyRoute, { prefix: '/api/v1' })
  app.register(sessionsRoute, { prefix: '/api/v1' })
  app.register(authRoute, { prefix: '/api/v1' })

  return app
}
