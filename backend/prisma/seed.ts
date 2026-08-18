import { PrismaClient, NumberStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

const PRIZES = [
  {
    position: 1,
    description: 'Un Vino Toro de Piedra',
    icon: 'solar:wineglass-bold-duotone',
  },
  {
    position: 2,
    description: 'Un Premio Sorpresa',
    icon: 'solar:gift-bold-duotone',
  },
  {
    position: 3,
    description: 'Un Premio Sorpresa',
    icon: 'solar:gift-bold-duotone',
  },
  {
    position: 4,
    description: 'Colgante de Plata',
    icon: 'game-icons:gem-pendant',
  },
  {
    position: 5,
    description: 'Set de Vasos Cerveceros',
    icon: 'solar:cup-bold-duotone',
  },
]

async function main() {
  console.log('Iniciando seed de desarrollo...')

  const adminUsername = process.env.ADMIN_USERNAME ?? 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123'

  await prisma.prize.deleteMany()
  await prisma.raffleNumber.deleteMany()
  await prisma.raffle.deleteMany()

  const passwordHash = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.admin.upsert({
    where: { username: adminUsername },
    update: {
      passwordHash,
    },
    create: {
      username: adminUsername,
      passwordHash,
    },
  })

  console.log(`Administrador "${admin.username}" listo`)

  const raffle = await prisma.raffle.create({
    data: {
      title: 'RIFA',
      description:
        'Rifa a beneficio de Maida, deportista destacada en ciclismo. Buscamos recaudar para nuevos componentes para su bicicleta.',
      price: 1000,
      raffleDate: new Date('2026-12-31T23:59:59-03:00'),
      backgroundImage: '/background.jpg',
      personImage: '/maida.svg',
      contactWhatsApp: '569XXXXXXXX',
      active: true,
      numbers: {
        create: Array.from({ length: 100 }, (_, index) => ({
          number: index + 1,
          status: NumberStatus.AVAILABLE,
        })),
      },
      prizes: {
        create: PRIZES,
      },
    },
  })

  const totalNumbers = await prisma.raffleNumber.count({
    where: { raffleId: raffle.id },
  })

  console.log(`Rifa "${raffle.title}" creada (id: ${raffle.id})`)
  console.log(`> ${totalNumbers} números creados`)
  console.log(`> ${PRIZES.length} premios creados`)
  console.log('Seed de desarrollo completado.')
}

main()
  .catch((error) => {
    console.error('Error ejecutando el seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })