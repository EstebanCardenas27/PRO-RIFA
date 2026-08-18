import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { prisma } from '../src/config/prisma'
import { resetDatabase } from './helpers'

const app = createApp()
let agent: ReturnType<typeof request.agent>
let raffleId = 0

beforeAll(async () => {
  const data = await resetDatabase()
  raffleId = data.active.id

  agent = request.agent(app)
  await agent
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'admin123' })
})
afterAll(() => prisma.$disconnect())

describe('Panel de administración', () => {
  it('requiere autenticación', async () => {
    const res = await request(app).get('/api/admin/raffles')
    expect(res.status).toBe(401)
  })

  it('lista las rifas autenticado', async () => {
    const res = await agent.get('/api/admin/raffles')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  describe('transiciones de número', () => {
    it('reservar (PENDING) sin nombre devuelve 400', async () => {
      const res = await agent
        .patch(`/api/admin/raffles/${raffleId}/numbers/1`)
        .send({ status: 'PENDING' })
      expect(res.status).toBe(400)
    })

    it('reservar (PENDING) con nombre y teléfono funciona', async () => {
      const res = await agent
        .patch(`/api/admin/raffles/${raffleId}/numbers/1`)
        .send({ status: 'PENDING', customerName: 'Ana Pérez', customerPhone: '56911112222' })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('PENDING')
      expect(res.body.customerName).toBe('Ana Pérez')
      expect(res.body.selectedAt).not.toBeNull()
      expect(res.body.soldAt).toBeNull()
    })

    it('vender (SOLD) un número pendiente funciona', async () => {
      const res = await agent
        .patch(`/api/admin/raffles/${raffleId}/numbers/1`)
        .send({ status: 'SOLD' })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('SOLD')
      expect(res.body.soldAt).not.toBeNull()
    })

    it('liberar (AVAILABLE) limpia los datos del cliente', async () => {
      const res = await agent
        .patch(`/api/admin/raffles/${raffleId}/numbers/1`)
        .send({ status: 'AVAILABLE' })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('AVAILABLE')
      expect(res.body.customerName).toBeNull()
      expect(res.body.customerPhone).toBeNull()
      expect(res.body.selectedAt).toBeNull()
      expect(res.body.soldAt).toBeNull()
    })

    it('estado inválido devuelve 400', async () => {
      const res = await agent
        .patch(`/api/admin/raffles/${raffleId}/numbers/1`)
        .send({ status: 'INVALIDO' })
      expect(res.status).toBe(400)
    })

    it('teléfono inválido devuelve 400', async () => {
      const res = await agent
        .patch(`/api/admin/raffles/${raffleId}/numbers/2`)
        .send({
          status: 'PENDING',
          customerName: 'Luis',
          customerPhone: 'abc',
        })
      expect(res.status).toBe(400)
    })

    it('número inexistente devuelve 404', async () => {
      const res = await agent
        .patch(`/api/admin/raffles/${raffleId}/numbers/999`)
        .send({ status: 'AVAILABLE' })
      expect(res.status).toBe(404)
    })
  })

  describe('actualización de la rifa', () => {
    it('whatsapp inválido devuelve 400', async () => {
      const res = await agent
        .patch(`/api/admin/raffles/${raffleId}`)
        .send({ contactWhatsApp: 'no-es-un-telefono' })
      expect(res.status).toBe(400)
    })

    it('título vacío devuelve 400', async () => {
      const res = await agent
        .patch(`/api/admin/raffles/${raffleId}`)
        .send({ title: '   ' })
      expect(res.status).toBe(400)
    })

    it('actualización válida devuelve la rifa editada', async () => {
      const res = await agent
        .patch(`/api/admin/raffles/${raffleId}`)
        .send({ title: 'RIFA Editada', price: 1500 })

      expect(res.status).toBe(200)
      expect(res.body.title).toBe('RIFA Editada')
      expect(res.body.price).toBe(1500)
    })
  })
})