import type {
  NumberStatus,
  Raffle,
  RifaNumber,
} from '../types/rifa'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export type BackendNumberStatus = 'AVAILABLE' | 'PENDING' | 'SOLD'

interface BackendPrize {
  id: number
  position: number
  description: string
  icon: string
}

interface BackendRifaNumber {
  id: number
  number: number
  status: BackendNumberStatus
}

interface BackendRaffle {
  id: number
  title: string
  description: string
  price: number
  raffleDate: string
  backgroundImage: string | null
  personImage: string | null
  contactWhatsApp: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  prizes?: BackendPrize[]
  numbers?: BackendRifaNumber[]
}

const NUMBER_STATUS_MAP: Record<BackendNumberStatus, NumberStatus> = {
  AVAILABLE: 'available',
  PENDING: 'pending',
  SOLD: 'sold',
}

function mapNumber(number: BackendRifaNumber): RifaNumber {
  return {
    id: number.id,
    number: number.number,
    status: NUMBER_STATUS_MAP[number.status],
  }
}

function mapRaffle(raffle: BackendRaffle): Raffle {
  return {
    id: raffle.id,
    title: raffle.title,
    description: raffle.description,
    price: raffle.price,
    raffleDate: raffle.raffleDate,
    backgroundImage: raffle.backgroundImage,
    personImage: raffle.personImage,
    contactWhatsApp: raffle.contactWhatsApp,
    active: raffle.active,
    createdAt: raffle.createdAt,
    updatedAt: raffle.updatedAt,
    prizes: raffle.prizes,
    numbers: raffle.numbers?.map(mapNumber),
  }
}

const REQUEST_TIMEOUT_MS = 10000

export async function getActiveRaffles(): Promise<Raffle[]> {
  const response = await apiFetch(`${API_BASE_URL}/raffles`)

  if (!response.ok) {
    throw new Error('No se pudo cargar la rifa desde el servidor')
  }

  const raffles: BackendRaffle[] = await response.json()

  return raffles.map(mapRaffle)
}

async function apiFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(input, {
      ...init,
      credentials: 'include',
      signal: controller.signal,
    })
  } finally {
    window.clearTimeout(timeout)
  }
}

/* ------------------------------------------------------------------------- */
/* Autenticación y administración                                             */
/* ------------------------------------------------------------------------- */

export class UnauthorizedError extends Error {
  constructor() {
    super('La sesión expiró, vuelve a iniciar sesión')
    this.name = 'UnauthorizedError'
  }
}

export type UpdateNumberStatus = 'AVAILABLE' | 'PENDING' | 'SOLD'

export interface AdminRifaNumber {
  id: number
  number: number
  status: BackendNumberStatus
  customerName: string | null
  customerPhone: string | null
  selectedAt: string | null
  soldAt: string | null
}

export interface AdminRaffle {
  id: number
  title: string
  description: string
  price: number
  raffleDate: string
  backgroundImage: string | null
  personImage: string | null
  contactWhatsApp: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  prizes: BackendPrize[]
}

export interface UpdateRafflePayload {
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

async function parseError(
  response: Response,
  options?: { isLogin?: boolean },
): Promise<never> {
  if (response.status === 401 && !options?.isLogin) {
    throw new UnauthorizedError()
  }

  let message =
    options?.isLogin && response.status === 401
      ? 'Credenciales inválidas'
      : 'Error inesperado del servidor'

  try {
    const data = await response.json()
    if (typeof data?.message === 'string') {
      message = data.message
    }
  } catch {
    // sin cuerpo legible
  }

  throw new Error(message)
}

export async function login(
  username: string,
  password: string,
): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!response.ok) {
    await parseError(response, { isLogin: true })
  }
}

export async function logout(): Promise<void> {
  await apiFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' })
}

export async function getMe(): Promise<{ username: string }> {
  const response = await apiFetch(`${API_BASE_URL}/admin/me`)

  if (!response.ok) {
    await parseError(response)
  }

  return response.json()
}

export async function getRaffleNumbers(
  raffleId: number,
): Promise<AdminRifaNumber[]> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/raffles/${raffleId}/numbers`,
  )

  if (!response.ok) {
    await parseError(response)
  }

  const data = await response.json()
  return data.numbers as AdminRifaNumber[]
}

export async function updateRaffleNumber(
  raffleId: number,
  number: number,
  payload: { status: UpdateNumberStatus; customerName?: string; customerPhone?: string },
): Promise<AdminRifaNumber> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/raffles/${raffleId}/numbers/${number}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    await parseError(response)
  }

  return response.json()
}

export async function getAdminRaffles(): Promise<AdminRaffle[]> {
  const response = await apiFetch(`${API_BASE_URL}/admin/raffles`)

  if (!response.ok) {
    await parseError(response)
  }

  return response.json()
}

export async function updateRaffle(
  raffleId: number,
  payload: UpdateRafflePayload,
): Promise<AdminRaffle> {
  const response = await apiFetch(`${API_BASE_URL}/admin/raffles/${raffleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    await parseError(response)
  }

  return response.json()
}
