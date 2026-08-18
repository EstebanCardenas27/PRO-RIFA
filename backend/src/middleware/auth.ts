import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../services/auth.service'
import { HttpError } from '../types/http-error'

export interface AuthRequest extends Request {
  adminId?: number
}

const COOKIE_NAME = 'pro-rifa-token'

export function requireAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization
  const cookieToken = (req.cookies as Record<string, string | undefined>)?.[
    COOKIE_NAME
  ]

  const token =
    header?.startsWith('Bearer ') ? header.slice(7) : cookieToken

  if (!token) {
    return next(new HttpError(401, 'No autorizado'))
  }

  try {
    const payload = verifyToken(token)
    req.adminId = payload.sub
    next()
  } catch {
    next(new HttpError(401, 'Token inválido o expirado'))
  }
}