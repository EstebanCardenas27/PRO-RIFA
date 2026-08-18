import type { NextFunction, Request, Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import { prisma } from '../config/prisma'
import * as adminService from '../services/admin.service'
import { HttpError } from '../types/http-error'
import { updateNumberSchema, updateRaffleSchema } from '../validation/schemas'

export async function getMe(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.adminId },
      select: { username: true },
    })

    if (!admin) {
      throw new HttpError(401, 'No autorizado')
    }

    res.json({ username: admin.username })
  } catch (error) {
    next(error)
  }
}

export async function getRaffleNumbers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const numbers = await adminService.getRaffleNumbers(req.params.id)
    res.json(numbers)
  } catch (error) {
    next(error)
  }
}

export async function getRaffles(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const raffles = await adminService.listAdminRaffles()
    res.json(raffles)
  } catch (error) {
    next(error)
  }
}

export async function updateRaffle(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = updateRaffleSchema.safeParse(req.body ?? {})

    if (!parsed.success) {
      throw new HttpError(
        400,
        parsed.error.issues[0]?.message ?? 'Datos inválidos',
      )
    }

    const raffle = await adminService.updateRaffle(
      req.params.id,
      parsed.data,
    )
    res.json(raffle)
  } catch (error) {
    next(error)
  }
}

export async function updateRaffleNumber(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = updateNumberSchema.safeParse(req.body ?? {})

    if (!parsed.success) {
      throw new HttpError(
        400,
        parsed.error.issues[0]?.message ?? 'Datos inválidos',
      )
    }

    const number = await adminService.updateRaffleNumber(
      req.params.id,
      req.params.number,
      parsed.data,
    )
    res.json(number)
  } catch (error) {
    next(error)
  }
}