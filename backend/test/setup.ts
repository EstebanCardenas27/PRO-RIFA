import dotenv from 'dotenv'

dotenv.config()

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL