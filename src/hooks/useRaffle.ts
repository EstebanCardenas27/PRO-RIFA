import { useCallback, useEffect, useState } from 'react'
import { getActiveRaffles } from '../services/api'
import type { Raffle } from '../types/rifa'

export function useRaffle(intervalMs?: number) {
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    getActiveRaffles()
      .then((raffles) => {
        if (raffles.length === 0) {
          setError('No hay rifas activas disponibles')
          return
        }

        setError(null)
        setRaffle(raffles[0])
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : 'Error al cargar la rifa',
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!intervalMs || intervalMs <= 0) {
      return
    }

    const id = window.setInterval(load, intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs, load])

  return { raffle, loading, error, refresh: load }
}