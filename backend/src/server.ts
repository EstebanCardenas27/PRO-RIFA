import { createApp } from './app'
import { env } from './config/env'
import { prisma } from './config/prisma'

async function bootstrap() {
  const app = createApp()

  await prisma.$connect()
  console.log('Conexión a la base de datos establecida')

  app.listen(env.port, () => {
    console.log(`API de PRO-RIFA escuchando en http://localhost:${env.port}`)
  })
}

bootstrap().catch(async (error) => {
  console.error('Error al iniciar el servidor:', error)
  await prisma.$disconnect()
  process.exit(1)
})