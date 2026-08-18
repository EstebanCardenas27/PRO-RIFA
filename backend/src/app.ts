import { existsSync } from 'node:fs'
import path from 'node:path'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env'
import { prisma } from './config/prisma'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'
import adminRoutes from './routes/admin.routes'
import authRoutes from './routes/auth.routes'
import raffleRoutes from './routes/raffle.routes'

const frontendDist = path.resolve(__dirname, '../../dist')

export function createApp() {
  const app = express()

  app.use(helmet({ contentSecurityPolicy: false }))
  app.use(
    cors({
      origin: [env.frontendOrigin],
      credentials: true,
    }),
  )
  app.use(express.json())
  app.use(cookieParser())

  app.get('/api/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`
      res.json({ status: 'ok' })
    } catch {
      res.status(503).json({ status: 'error' })
    }
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/raffles', raffleRoutes)
  app.use('/api/admin', adminRoutes)

  if (existsSync(frontendDist)) {
    app.use(express.static(frontendDist))
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.join(frontendDist, 'index.html'))
    })
  }

  app.use(notFound)
  app.use(errorHandler)

  return app
}