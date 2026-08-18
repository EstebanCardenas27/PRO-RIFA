import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { prisma } from '../src/config/prisma'
import { resetDatabase } from './helpers'

const app = createApp()
let activeId = 0
let inactiveId = 0

beforeAll(async () => {
  const data = await resetDatabase()
  activeId = data.active.id
  inactiveId = data.inactive.id
})
afterAll(() => prisma.$disconnect())

describe('API pública de rifas', () => {
  it('lista solo rifas activas', async () => {
    const res = await request(app).get('/api/raffles')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].id).toBe(activeId)
    expect(res.body[0].numbers).toHaveLength(3)
  })

  it('devuelve una rifa activa por id', async () => {
    const res = await request(app).get(`/api/raffles/${activeId}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(activeId)
    expect(res.body.title).toBe('RIFA Activa')
  })

  it('NO expone rifas inactivas por id (404)', async () => {
    const res = await request(app).get(`/api/raffles/${inactiveId}`)
    expect(res.status).toBe(404)
  })

  it('NO expone los números de una rifa inactiva (404)', async () => {
    const res = await request(app).get(`/api/raffles/${inactiveId}/numbers`)
    expect(res.status).toBe(404)
  })

  it('devuelve los números de una rifa activa', async () => {
    const res = await request(app).get(`/api/raffles/${activeId}/numbers`)
    expect(res.status).toBe(200)
    expect(res.body.numbers).toHaveLength(3)
    expect(res.body.numbers[0]).toHaveProperty('number')
    expect(res.body.numbers[0]).toHaveProperty('status')
    expect(res.body.numbers[0]).not.toHaveProperty('customerName')
  })

  it('id inexistente devuelve 404', async () => {
    const res = await request(app).get('/api/raffles/99999')
    expect(res.status).toBe(404)
  })

  it('id inválido devuelve 400', async () => {
    const res = await request(app).get('/api/raffles/abc')
    expect(res.status).toBe(400)
  })
})