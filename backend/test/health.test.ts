import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { prisma } from '../src/config/prisma'
import { resetDatabase } from './helpers'

const app = createApp()

beforeAll(resetDatabase)
afterAll(() => prisma.$disconnect())

describe('GET /api/health', () => {
  it('responde ok cuando la base de datos responde', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})