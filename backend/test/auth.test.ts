import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { prisma } from '../src/config/prisma'
import { resetDatabase } from './helpers'

const app = createApp()

beforeAll(resetDatabase)
afterAll(() => prisma.$disconnect())

describe('Autenticación', () => {
  it('login exitoso devuelve username y setea cookie httpOnly', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ username: 'admin' })
    expect(res.headers['set-cookie']?.[0]).toContain('pro-rifa-token=')
    expect(res.headers['set-cookie']?.[0]).toContain('HttpOnly')
  })

  it('login con contraseña incorrecta devuelve 401 con mensaje claro', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'incorrecta' })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ message: 'Credenciales inválidas' })
  })

  it('login sin campos devuelve 400', async () => {
    const res = await request(app).post('/api/auth/login').send({})
    expect(res.status).toBe(400)
  })

  it('GET /api/admin/me sin cookie devuelve 401', async () => {
    const res = await request(app).get('/api/admin/me')
    expect(res.status).toBe(401)
  })

  it('GET /api/admin/me con cookie devuelve el usuario', async () => {
    const agent = request.agent(app)

    const login = await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' })
    expect(login.status).toBe(200)

    const me = await agent.get('/api/admin/me')
    expect(me.status).toBe(200)
    expect(me.body).toEqual({ username: 'admin' })
  })

  it('POST /api/auth/logout limpia la cookie', async () => {
    const agent = request.agent(app)

    await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' })

    const logout = await agent.post('/api/auth/logout')
    expect(logout.status).toBe(204)

    const me = await agent.get('/api/admin/me')
    expect(me.status).toBe(401)
  })
})