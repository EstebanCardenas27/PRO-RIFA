import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env'
import { HttpError } from '../types/http-error'

interface ParseError extends SyntaxError {
  status?: number
  type?: string
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message })
  }

  const parseError = error as ParseError
  if (
    parseError instanceof SyntaxError &&
    (parseError.status === 400 || parseError.type === 'entity.parse.failed')
  ) {
    return res.status(400).json({ message: 'Cuerpo de la petición inválido' })
  }

  console.error(error)

  const message =
    env.nodeEnv === 'production'
      ? 'Error interno del servidor'
      : error instanceof Error
        ? error.message
        : 'Error interno del servidor'

  return res.status(500).json({ message })
}