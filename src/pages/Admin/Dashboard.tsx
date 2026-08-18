import { useCallback, useEffect, useMemo, useState } from 'react'
import { Icon } from '../../components/Icons/Icon'
import { NumberModal } from '../../components/NumberModal/NumberModal'
import { RIFA_PRICE } from '../../constants/rifa'
import {
  UnauthorizedError,
  getAdminRaffles,
  getRaffleNumbers,
  updateRaffle,
  updateRaffleNumber,
  type AdminRaffle,
  type AdminRifaNumber,
  type UpdateNumberStatus,
  type UpdateRafflePayload,
} from '../../services/api'
import { Settings } from './Settings'

interface DashboardProps {
  onLogout: () => void
}

type Tab = 'board' | 'pending' | 'sold' | 'settings'
type BoardFilter = 'all' | 'AVAILABLE' | 'PENDING' | 'SOLD'

const POLL_INTERVAL_MS = 10000

const FILTERS: Array<{ value: BoardFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'AVAILABLE', label: 'Disponibles' },
  { value: 'PENDING', label: 'Reservados' },
  { value: 'SOLD', label: 'Vendidos' },
]

export const Dashboard = ({ onLogout }: DashboardProps) => {
  const [raffle, setRaffle] = useState<AdminRaffle | null>(null)
  const [numbers, setNumbers] = useState<AdminRifaNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<AdminRifaNumber | null>(null)
  const [tab, setTab] = useState<Tab>('board')
  const [filter, setFilter] = useState<BoardFilter>('all')

  const loadData = useCallback(() => {
    getAdminRaffles()
      .then((raffles) => {
        if (raffles.length === 0) {
          throw new Error('No hay rifas registradas')
        }

        setError(null)
        setRaffle(raffles[0])
        return getRaffleNumbers(raffles[0].id)
      })
      .then((data) => setNumbers(data))
      .catch((err: unknown) => {
        if (err instanceof UnauthorizedError) {
          onLogout()
          return
        }
        setError(
          err instanceof Error ? err.message : 'Error al cargar el panel',
        )
      })
      .finally(() => setLoading(false))
  }, [onLogout])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const id = window.setInterval(loadData, POLL_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [loadData])

  const price = raffle?.price ?? RIFA_PRICE
  const totalNumbers = numbers.length

  const availableNumbers = useMemo(
    () => numbers.filter((item) => item.status === 'AVAILABLE').length,
    [numbers],
  )
  const pendingNumbers = useMemo(
    () => numbers.filter((item) => item.status === 'PENDING').length,
    [numbers],
  )
  const soldNumbers = useMemo(
    () => numbers.filter((item) => item.status === 'SOLD').length,
    [numbers],
  )

  const collected = soldNumbers * price
  const soldPercent =
    totalNumbers === 0
      ? 0
      : Math.round((soldNumbers / totalNumbers) * 100)

  const stats = [
    {
      label: 'Disponibles',
      value: availableNumbers,
      icon: 'solar:ticket-bold-duotone',
    },
    {
      label: 'Pendientes',
      value: pendingNumbers,
      icon: 'solar:clock-circle-bold-duotone',
    },
    {
      label: 'Vendidos',
      value: soldNumbers,
      icon: 'solar:ticket-check-bold-duotone',
    },
    {
      label: 'Recaudado',
      value: `$${collected.toLocaleString('es-CL')}`,
      icon: 'solar:hand-money-bold-duotone',
    },
  ]

  const tabs: Array<{ value: Tab; label: string; count?: number }> = [
    { value: 'board', label: 'Tablero' },
    { value: 'pending', label: 'Reservas', count: pendingNumbers },
    { value: 'sold', label: 'Vendidos', count: soldNumbers },
    { value: 'settings', label: 'Configuración' },
  ]

  const handleRefresh = () => {
    setLoading(true)
    setError(null)
    loadData()
  }

  const updateNumberStatus = async (
    item: AdminRifaNumber,
    status: UpdateNumberStatus,
  ) => {
    if (!raffle) {
      return
    }

    try {
      const updated = await updateRaffleNumber(raffle.id, item.number, {
        status,
      })

      setNumbers((current) =>
        current.map((number) =>
          number.number === updated.number ? updated : number,
        ),
      )
      setError(null)
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        onLogout()
        return
      }
      setError(
        err instanceof Error ? err.message : 'No se pudo actualizar el número',
      )
    }
  }

  const handleSaveNumber = async (
    status: UpdateNumberStatus,
    customerName: string,
    customerPhone: string,
  ) => {
    if (!raffle || !editing) {
      return
    }

    try {
      const updated = await updateRaffleNumber(raffle.id, editing.number, {
        status,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
      })

      setNumbers((current) =>
        current.map((number) =>
          number.number === updated.number ? updated : number,
        ),
      )
      setEditing(null)
      setError(null)
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        onLogout()
        return
      }
      throw err
    }
  }

  const handleSaveRaffle = async (
    payload: UpdateRafflePayload,
  ): Promise<AdminRaffle> => {
    if (!raffle) {
      throw new Error('No hay rifa cargada')
    }

    const updated = await updateRaffle(raffle.id, payload)
    setRaffle(updated)
    setError(null)
    return updated
  }

  const handleWhatsApp = () => {
    const message = [
      `${raffle?.title ?? 'RIFA'} · Avance de la rifa`,
      `${soldNumbers} de ${totalNumbers} números vendidos (${soldPercent}%).`,
      `${availableNumbers} números disponibles a $${price.toLocaleString('es-CL')}.`,
      'Reserva los tuyos y apoya la causa.',
    ].join('\n')

    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const handleCapture = () => {
    window.open('/rifa', '_blank', 'noopener,noreferrer')
  }

  const displayedNumbers =
    filter === 'all'
      ? numbers
      : numbers.filter((item) => item.status === filter)

  if (loading && !raffle) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <Icon
            name="solar:refresh-bold-duotone"
            width={38}
            height={38}
            className="animate-spin text-amber-300"
          />

          <p className="text-sm text-white/60">Cargando rifa...</p>
        </div>
      </main>
    )
  }

  if (error && !raffle) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
        <div className="max-w-md rounded-3xl border border-red-900/60 bg-red-950/20 p-8 text-center backdrop-blur-md">
          <Icon
            name="solar:danger-triangle-bold-duotone"
            width={42}
            height={42}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-4 text-xl font-bold">
            No se pudo cargar el panel
          </h1>

          <p className="mt-2 text-sm text-white/60">{error}</p>

          <button
            type="button"
            onClick={onLogout}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-700/60 bg-amber-900/30 px-5 py-3 text-sm font-bold text-amber-200 transition hover:bg-amber-800/40"
          >
            <Icon
              name="solar:logout-2-bold-duotone"
              width={19}
              height={19}
            />

            Volver a iniciar sesión
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="border-b border-white/10 pb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Icon
                  name="solar:settings-bold-duotone"
                  width={23}
                  height={23}
                  className="text-amber-300"
                />

                <span className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
                  Administración
                </span>
              </div>

              <h1 className="mt-2 text-3xl font-black">
                {raffle?.title ?? 'RIFA'}
              </h1>

              <p className="mt-1 text-sm text-white/40">
                Panel de control de la rifa
              </p>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <Icon
                name="solar:logout-2-bold-duotone"
                width={19}
                height={19}
              />

              Salir
            </button>
          </div>
        </header>

        {/* ESTADÍSTICAS */}
        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <Icon
                name={stat.icon}
                width={25}
                height={25}
                className="text-amber-300"
              />

              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-white/40">
                {stat.label}
              </p>

              <p className="mt-1 text-2xl font-black">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* TABS */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={[
                'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition',
                tab === item.value
                  ? 'border-amber-500/70 bg-amber-900/20 text-amber-300'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              {item.label}

              {item.count !== undefined && (
                <span
                  className={[
                    'rounded-full px-2 py-0.5 text-xs',
                    tab === item.value
                      ? 'bg-amber-500/20 text-amber-200'
                      : 'bg-white/10 text-white/50',
                  ].join(' ')}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon
                name="solar:refresh-bold-duotone"
                width={17}
                height={17}
                className={loading ? 'animate-spin' : ''}
              />

              Actualizar
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* CONTENIDO */}
        {tab === 'board' && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold">Estado de números</h2>

                  <p className="mt-1 text-xs text-white/40">
                    Toca un número para reservar, vender o liberar.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {FILTERS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilter(item.value)}
                      className={[
                        'rounded-lg border px-3 py-1.5 text-xs font-bold transition',
                        filter === item.value
                          ? 'border-amber-500/70 bg-amber-900/20 text-amber-300'
                          : 'border-white/10 text-white/50 hover:bg-white/10 hover:text-white',
                      ].join(' ')}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-10">
                {displayedNumbers.map((item) => (
                  <button
                    key={item.number}
                    type="button"
                    onClick={() => setEditing(item)}
                    className={[
                      'aspect-square rounded-lg border text-xs font-bold transition hover:scale-105',
                      item.status === 'AVAILABLE'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                        : '',
                      item.status === 'PENDING'
                        ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20'
                        : '',
                      item.status === 'SOLD'
                        ? 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20'
                        : '',
                    ].join(' ')}
                  >
                    {item.number}
                  </button>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="font-bold">Acciones</h2>

                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="flex w-full items-center gap-3 rounded-xl border border-green-700/50 bg-green-900/20 px-4 py-3 text-left text-sm font-bold text-green-300 transition hover:bg-green-900/30"
                  >
                    <Icon
                      name="logos:whatsapp-icon"
                      width={21}
                      height={21}
                    />

                    WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={handleCapture}
                    className="flex w-full items-center gap-3 rounded-xl border border-amber-700/50 bg-amber-900/20 px-4 py-3 text-left text-sm font-bold text-amber-300 transition hover:bg-amber-900/30"
                  >
                    <Icon
                      name="solar:camera-bold-duotone"
                      width={21}
                      height={21}
                    />

                    Ver publicación
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-sm font-bold">Progreso</h2>

                <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-black/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                    style={{ width: `${soldPercent}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-white/50">
                  {soldNumbers} de {totalNumbers} números vendidos
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-sm font-bold">Estados</h2>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    Disponible
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    Pendiente
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    Vendido
                  </div>
                </div>
              </div>
            </aside>
          </section>
        )}

        {tab === 'pending' && (
          <section className="mt-6">
            <h2 className="font-bold">Reservas pendientes</h2>

            <p className="mt-1 text-xs text-white/40">
              Números reservados por WhatsApp. Confirma el pago para
              marcarlos como vendidos.
            </p>

            {pendingNumbers === 0 ? (
              <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/40">
                No hay reservas pendientes.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {numbers
                  .filter((item) => item.status === 'PENDING')
                  .map((item) => (
                    <div
                      key={item.number}
                      className="flex flex-col gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-950/10 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-base font-black text-yellow-300">
                        {item.number}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">
                          {item.customerName ?? 'Sin nombre'}
                        </p>

                        <p className="truncate text-sm text-white/50">
                          {item.customerPhone ?? 'Sin teléfono'}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {item.customerPhone && (
                          <a
                            href={`https://wa.me/${item.customerPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-green-700/50 bg-green-900/20 px-3 py-2 text-xs font-bold text-green-300 transition hover:bg-green-900/30"
                          >
                            <Icon
                              name="logos:whatsapp-icon"
                              width={16}
                              height={16}
                            />

                            Contactar
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => updateNumberStatus(item, 'SOLD')}
                          className="flex items-center gap-1.5 rounded-lg border border-red-600/50 bg-red-900/20 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-900/30"
                        >
                          <Icon
                            name="solar:ticket-check-bold-duotone"
                            width={16}
                            height={16}
                          />

                          Vender
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateNumberStatus(item, 'AVAILABLE')
                          }
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
                        >
                          <Icon
                            name="solar:restart-bold"
                            width={16}
                            height={16}
                          />

                          Liberar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {tab === 'sold' && (
          <section className="mt-6">
            <h2 className="font-bold">Números vendidos</h2>

            <p className="mt-1 text-xs text-white/40">
              Lista de clientes que ya confirmaron su pago.
            </p>

            {soldNumbers === 0 ? (
              <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/40">
                Aún no hay números vendidos.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {numbers
                  .filter((item) => item.status === 'SOLD')
                  .map((item) => (
                    <div
                      key={item.number}
                      className="flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-950/10 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10 text-base font-black text-red-300">
                        {item.number}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">
                          {item.customerName ?? 'Sin nombre'}
                        </p>

                        <p className="truncate text-sm text-white/50">
                          {item.customerPhone ?? 'Sin teléfono'}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {item.customerPhone && (
                          <a
                            href={`https://wa.me/${item.customerPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-green-700/50 bg-green-900/20 px-3 py-2 text-xs font-bold text-green-300 transition hover:bg-green-900/30"
                          >
                            <Icon
                              name="logos:whatsapp-icon"
                              width={16}
                              height={16}
                            />

                            Contactar
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            updateNumberStatus(item, 'AVAILABLE')
                          }
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
                        >
                          <Icon
                            name="solar:restart-bold"
                            width={16}
                            height={16}
                          />

                          Liberar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {tab === 'settings' && raffle && (
          <section className="mt-6">
            <Settings raffle={raffle} onSave={handleSaveRaffle} />
          </section>
        )}
      </div>

      {editing && (
        <NumberModal
          key={editing.id}
          number={editing}
          onClose={() => setEditing(null)}
          onSave={handleSaveNumber}
        />
      )}
    </main>
  )
}