import type { NextFunction, Request, Response } from 'express'
import * as raffleService from '../services/raffle.service'

export async function getRaffles(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const raffles = await raffleService.listRaffles()
    res.json(raffles)
  } catch (error) {
    next(error)
  }
}

export async function getRaffleById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const raffle = await raffleService.getRaffleById(req.params.id)
    res.json(raffle)
  } catch (error) {
    next(error)
  }
}

export async function getNumbersByRaffleId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const numbers = await raffleService.getNumbersByRaffleId(req.params.id)
    res.json(numbers)
  } catch (error) {
    next(error)
  }
}