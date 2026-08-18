import { execSync } from 'node:child_process'
import dotenv from 'dotenv'

dotenv.config()

const testUrl = process.env.TEST_DATABASE_URL

if (!testUrl) {
  console.error('Falta TEST_DATABASE_URL en backend/.env')
  process.exit(1)
}

process.env.DATABASE_URL = testUrl

console.log('Aplicando migraciones a la base de tests...')
execSync('prisma migrate deploy', { stdio: 'inherit' })

console.log('Ejecutando tests...')
execSync('vitest run', { stdio: 'inherit' })