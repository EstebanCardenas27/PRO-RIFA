import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'
import { HttpError } from '../types/http-error'
import { parseRaffleId } from './raffle.service'

export type NumberStatusInput = 'AVAILABLE' | 'PENDING' | 'SOLD'

export interface UpdateNumberInput {
  status: NumberStatusInput
  customerName?: string
  customerPhone?: string
}

export interface UpdateRaffleInput {
  title?: string
  description?: string
  price?: number
  raffleDate?: string
  backgroundImage?: string | null
  personImage?: string | null
  contactWhatsApp?: string | null
  active?: boolean
  prizes?: Array<{
    position: number
    description: string
    icon: string
  }>
}

function parseNumberValue(rawNumber: string): number {
  const number = Number(rawNumber)

  if (!Number.isInteger(number) || number <= 0) {
    throw new HttpError(400, 'Número de rifa inválido')
  }

  return number
}

export async function getRaffleNumbers(rawRaffleId: string) {
  const raffleId = parseRaffleId(rawRaffleId)

  const raffle = await prisma.raffle.findUnique({
    where: { id: raffleId },
    select: { id: true },
  })

  if (!raffle) {
    throw new HttpError(404, 'Rifa no encontrada')
  }

  const numbers = await prisma.raffleNumber.findMany({
    where: { raffleId },
    orderBy: { number: 'asc' },
  })

  return {
    raffleId,
    numbers,
  }
}

export async function updateRaffleNumber(
  rawRaffleId: string,
  rawNumber: string,
  body: UpdateNumberInput,
) {
  const raffleId = parseRaffleId(rawRaffleId)
  const numberValue = parseNumberValue(rawNumber)

  const statuses: NumberStatusInput[] = ['AVAILABLE', 'PENDING', 'SOLD']
  if (!statuses.includes(body.status)) {
    throw new HttpError(400, 'Estado inválido')
  }

  const raffle = await prisma.raffle.findUnique({
    where: { id: raffleId },
    select: { id: true },
  })

  if (!raffle) {
    throw new HttpError(404, 'Rifa no encontrada')
  }

  const existing = await prisma.raffleNumber.findUnique({
    where: {
      raffleId_number: { raffleId, number: numberValue },
    },
  })

  if (!existing) {
    throw new HttpError(404, 'Número no encontrado en esta rifa')
  }

  const customerName =
    typeof body.customerName === 'string'
      ? body.customerName.trim()
      : undefined
  const customerPhone =
    typeof body.customerPhone === 'string'
      ? body.customerPhone.trim()
      : undefined

  const data: Prisma.RaffleNumberUpdateInput = {}

  if (body.status === 'AVAILABLE') {
    data.status = 'AVAILABLE'
    data.customerName = null
    data.customerPhone = null
    data.selectedAt = null
    data.soldAt = null
  } else {
    if (!existing.customerName && !customerName) {
      throw new HttpError(400, 'El nombre del cliente es obligatorio')
    }
    if (!existing.customerPhone && !customerPhone) {
      throw new HttpError(400, 'El teléfono del cliente es obligatorio')
    }

    data.status = body.status

    if (customerName) {
      data.customerName = customerName
    }
    if (customerPhone) {
      data.customerPhone = customerPhone
    }
    if (!existing.selectedAt) {
      data.selectedAt = new Date()
    }
    if (body.status === 'SOLD' && !existing.soldAt) {
      data.soldAt = new Date()
    }
  }

  return prisma.raffleNumber.update({
    where: {
      raffleId_number: { raffleId, number: numberValue },
    },
    data,
  })
}

export async function listAdminRaffles() {
  return prisma.raffle.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      prizes: {
        orderBy: { position: 'asc' },
      },
    },
  })
}

export async function updateRaffle(
  rawId: string,
  body: UpdateRaffleInput,
) {
  const id = parseRaffleId(rawId)

  const raffle = await prisma.raffle.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!raffle) {
    throw new HttpError(404, 'Rifa no encontrada')
  }

  const data: Prisma.RaffleUpdateInput = {}

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      throw new HttpError(400, 'El título es obligatorio')
    }
    data.title = body.title.trim()
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      throw new HttpError(400, 'La descripción es inválida')
    }
    data.description = body.description.trim()
  }

  if (body.price !== undefined) {
    if (!Number.isInteger(body.price) || body.price <= 0) {
      throw new HttpError(400, 'El precio es inválido')
    }
    data.price = body.price
  }

  if (body.raffleDate !== undefined) {
    const date = new Date(body.raffleDate)
    if (Number.isNaN(date.getTime())) {
      throw new HttpError(400, 'La fecha del sorteo es inválida')
    }
    data.raffleDate = date
  }

  if (body.backgroundImage !== undefined) {
    data.backgroundImage = body.backgroundImage?.trim() || null
  }

  if (body.personImage !== undefined) {
    data.personImage = body.personImage?.trim() || null
  }

  if (body.contactWhatsApp !== undefined) {
    data.contactWhatsApp = body.contactWhatsApp?.trim() || null
  }

  if (body.active !== undefined) {
    if (typeof body.active !== 'boolean') {
      throw new HttpError(400, 'El estado activo es inválido')
    }
    data.active = body.active
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (body.prizes !== undefined) {
      if (!Array.isArray(body.prizes) || body.prizes.length === 0) {
        throw new HttpError(400, 'Debe existir al menos un premio')
      }

      const prizes = body.prizes.map((prize) => {
        if (!Number.isInteger(prize.position) || prize.position <= 0) {
          throw new HttpError(400, 'La posición de un premio es inválida')
        }
        if (
          typeof prize.description !== 'string' ||
          !prize.description.trim()
        ) {
          throw new HttpError(400, 'La descripción de un premio es inválida')
        }
        if (typeof prize.icon !== 'string' || !prize.icon.trim()) {
          throw new HttpError(400, 'El icono de un premio es inválido')
        }

        return {
          position: prize.position,
          description: prize.description.trim(),
          icon: prize.icon.trim(),
        }
      })

      await tx.prize.deleteMany({ where: { raffleId: id } })
      await tx.prize.createMany({
        data: prizes.map((prize) => ({ ...prize, raffleId: id })),
      })
    }

    return tx.raffle.update({
      where: { id },
      data,
      include: {
        prizes: { orderBy: { position: 'asc' } },
      },
    })
  })

  return updated
}