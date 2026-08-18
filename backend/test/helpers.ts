import bcrypt from 'bcryptjs'
import { prisma } from '../src/config/prisma'

export async function resetDatabase() {
  await prisma.prize.deleteMany()
  await prisma.raffleNumber.deleteMany()
  await prisma.raffle.deleteMany()
  await prisma.admin.deleteMany()

  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      passwordHash: await bcrypt.hash('admin123', 4),
    },
  })

  const active = await prisma.raffle.create({
    data: {
      title: 'RIFA Activa',
      description: 'Rifa de prueba',
      price: 1000,
      raffleDate: new Date('2026-12-31T23:59:59.000Z'),
      active: true,
      contactWhatsApp: '56912345678',
      numbers: {
        create: [1, 2, 3].map((number) => ({ number, status: 'AVAILABLE' })),
      },
      prizes: {
        create: {
          position: 1,
          description: 'Premio 1',
          icon: 'solar:gift-bold-duotone',
        },
      },
    },
  })

  const inactive = await prisma.raffle.create({
    data: {
      title: 'RIFA Inactiva',
      description: 'Rifa cerrada',
      price: 500,
      raffleDate: new Date('2026-12-31T23:59:59.000Z'),
      active: false,
      numbers: {
        create: [{ number: 1, status: 'AVAILABLE' }],
      },
    },
  })

  return { admin, active, inactive }
}