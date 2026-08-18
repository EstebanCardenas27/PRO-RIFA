import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { prisma } from '../config/prisma'
import { HttpError } from '../types/http-error'

const TOKEN_ISSUER = 'pro-rifa-api'
const TOKEN_AUDIENCE = 'pro-rifa-admin'

export async function loginAdmin(username: string, password: string) {
  const admin = await prisma.admin.findUnique({
    where: { username },
  })

  if (!admin) {
    throw new HttpError(401, 'Credenciales inválidas')
  }

  const passwordOk = await bcrypt.compare(password, admin.passwordHash)

  if (!passwordOk) {
    throw new HttpError(401, 'Credenciales inválidas')
  }

  const token = jwt.sign({ sub: admin.id }, env.jwtSecret, {
    expiresIn: '1d',
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
  })

  return {
    token,
    username: admin.username,
  }
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.jwtSecret, {
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
  }) as unknown as { sub: number }
}