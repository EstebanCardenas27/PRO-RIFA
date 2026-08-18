import { prisma } from '../config/prisma'
import { HttpError } from '../types/http-error'

export function parseRaffleId(rawId: string): number {
  const id = Number(rawId)

  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'ID de rifa inválido')
  }

  return id
}

export async function listRaffles() {
  const raffles = await prisma.raffle.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
    include: {
      prizes: {
        orderBy: { position: 'asc' },
      },
      numbers: {
        orderBy: { number: 'asc' },
        select: {
          id: true,
          number: true,
          status: true,
        },
      },
    },
  })

  return raffles
}

export async function getRaffleById(rawId: string) {
  const id = parseRaffleId(rawId)

  const raffle = await prisma.raffle.findUnique({
    where: { id, active: true },
    include: {
      prizes: {
        orderBy: { position: 'asc' },
      },
    },
  })

  if (!raffle) {
    throw new HttpError(404, 'Rifa no encontrada')
  }

  return raffle
}

export async function getNumbersByRaffleId(rawId: string) {
  const id = parseRaffleId(rawId)

  const raffle = await prisma.raffle.findUnique({
    where: { id, active: true },
    select: { id: true },
  })

  if (!raffle) {
    throw new HttpError(404, 'Rifa no encontrada')
  }

  const numbers = await prisma.raffleNumber.findMany({
    where: { raffleId: id },
    orderBy: { number: 'asc' },
    select: {
      id: true,
      number: true,
      status: true,
    },
  })

  return {
    raffleId: id,
    numbers,
  }
}