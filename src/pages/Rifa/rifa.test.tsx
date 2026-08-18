import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Rifa } from './rifa'
import type { Raffle } from '../../types/rifa'

const { useRaffleMock } = vi.hoisted(() => ({
  useRaffleMock: vi.fn(),
}))

vi.mock('../../hooks/useRaffle', () => ({
  useRaffle: useRaffleMock,
}))

const raffle: Raffle = {
  id: 1,
  title: 'RIFA TEST',
  description: 'Descripción de prueba',
  price: 1000,
  raffleDate: '2026-12-31T23:59:59.000Z',
  backgroundImage: '/background.jpg',
  personImage: '/maida.svg',
  contactWhatsApp: null,
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  prizes: [],
  numbers: [],
}

function renderRifa() {
  return render(
    <MemoryRouter>
      <Rifa />
    </MemoryRouter>,
  )
}

describe('Rifa', () => {
  beforeEach(() => {
    useRaffleMock.mockReset()
  })

  it('muestra pantalla de error cuando falla la carga sin datos', () => {
    useRaffleMock.mockReturnValue({
      raffle: null,
      loading: false,
      error: 'Error de red',
      refresh: () => {},
    })

    renderRifa()
    expect(screen.getByText('No se pudo cargar la rifa')).toBeTruthy()
  })

  it('mantiene el contenido si ya hay datos aunque el refresh falle', () => {
    useRaffleMock.mockReturnValue({
      raffle,
      loading: false,
      error: 'Error de red',
      refresh: () => {},
    })

    renderRifa()
    expect(screen.queryByText('No se pudo cargar la rifa')).toBeNull()
    expect(screen.getByText('RIFA TEST')).toBeTruthy()
  })
})