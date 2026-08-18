import type { NextFunction, Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { HttpError } from '../types/http-error'
import { loginSchema } from '../validation/schemas'

const COOKIE_NAME = 'pro-rifa-token'

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body ?? {})

    if (!parsed.success) {
      throw new HttpError(
        400,
        parsed.error.issues[0]?.message ?? 'Credenciales inválidas',
      )
    }

    const result = await authService.loginAdmin(
      parsed.data.username,
      parsed.data.password,
    )

    res.cookie(COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    })

    res.json({ username: result.username })
  } catch (error) {
    next(error)
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME)
  res.status(204).end()
}