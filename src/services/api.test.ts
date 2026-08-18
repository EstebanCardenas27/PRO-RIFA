import { afterEach, describe, expect, it, vi } from 'vitest'
import { UnauthorizedError, getMe, login } from './api'

function fakeResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('services/api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('login con 401 lanza "Credenciales inválidas" (no "sesión expirada")', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fakeResponse(401, { message: 'Credenciales inválidas' }),
      ),
    )

    await expect(login('admin', 'incorrecta')).rejects.toThrow(
      'Credenciales inválidas',
    )
  })

  it('getMe con 401 lanza UnauthorizedError con mensaje de sesión expirada', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(fakeResponse(401, { message: 'No autorizado' })),
    )

    await expect(getMe()).rejects.toBeInstanceOf(UnauthorizedError)
    await expect(getMe()).rejects.toThrow('La sesión expiró')
  })
})