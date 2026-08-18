import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icons/Icon'
import { NumberBoard } from '../../components/NumberBoard/NumberBoard'
import { PrizeList } from '../../components/PrizeList/PrizeList'
import { SelectionSummary } from '../../components/SelectionSummary/SelectionSummary'
import { WhatsAppButton } from '../../components/WhatsAppButton/WhatsAppButton'
import { RifaProgress } from '../../components/RifaProgress/RifaProgress'

import { Link } from 'react-router-dom'
import {
  prizes as fallbackPrizes,
  RIFA_PRICE,
  WHATSAPP_NUMBER,
} from '../../constants/rifa'
import { useRaffle } from '../../hooks/useRaffle'
import type { RifaNumber } from '../../types/rifa'

export const Rifa = () => {
  const { raffle, loading, error } = useRaffle(10000)
  const [selectedSet, setSelectedSet] = useState<Set<number>>(
    () => new Set(),
  )

  const numbers = useMemo(
    () =>
      (raffle?.numbers ?? []).map((item): RifaNumber => {
        if (
          selectedSet.has(item.number) &&
          item.status !== 'sold' &&
          item.status !== 'pending'
        ) {
          return { ...item, status: 'selected' }
        }

        return item
      }),
    [raffle, selectedSet],
  )

  const selectedNumbers = useMemo(
    () =>
      numbers
        .filter((item) => item.status === 'selected')
        .map((item) => item.number),
    [numbers],
  )

  const price = raffle?.price ?? RIFA_PRICE
  const phoneNumber = raffle?.contactWhatsApp ?? WHATSAPP_NUMBER

  const total = useMemo(
    () => selectedNumbers.length * price,
    [selectedNumbers, price],
  )

  const handleNumberClick = (number: number) => {
    const item = numbers.find((candidate) => candidate.number === number)

    if (!item || item.status === 'sold' || item.status === 'pending') {
      return
    }

    setSelectedSet((current) => {
      const next = new Set(current)

      if (next.has(number)) {
        next.delete(number)
      } else {
        next.add(number)
      }

      return next
    })
  }

  const handleClearSelection = () => {
    setSelectedSet(new Set())
  }

  if (loading) {
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
            No se pudo cargar la rifa
          </h1>

          <p className="mt-2 text-sm text-white/60">
            {error}
          </p>

          <p className="mt-4 text-xs text-white/40">
            Verifica que el servidor esté disponible en el puerto
            4000.
          </p>
        </div>
      </main>
    )
  }

  const title = raffle?.title ?? 'RIFA'
  const description =
    raffle?.description ??
    'Rifa a beneficio de Maida, deportista destacada en ciclismo. Buscamos recaudar para nuevos componentes para su bicicleta.'
  const backgroundImage = raffle?.backgroundImage ?? '/background.jpg'
  const personImage = raffle?.personImage ?? '/cyclist.png'
  const prizes = raffle?.prizes?.length
    ? raffle.prizes
    : fallbackPrizes

  return (
    <main className="max-w-4xl mx-auto min-h-screen bg-neutral-950 text-white">
      <div className="relative min-h-screen overflow-hidden">
        
        <div
          className="fixed inset-0 bg-cover bg-no-repeat bg-center"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
          }}
        />

        <div className="fixed inset-0 bg-black/70" />

        <div className="fixed inset-0 bg-linear-to-b from-black/40 via-black/60 to-black/90" />
        
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mb-6 flex justify-end">
                <Link
                    to="/admin"
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white/60 backdrop-blur-md transition hover:border-amber-700/60 hover:bg-black/60 hover:text-amber-300"
                >
                    <Icon
                    name="solar:login-3-bold-duotone"
                    width={19}
                    height={19}
                    />

                    Ingresar
                </Link>
            </div>
          
            <header className="mx-auto max-w-4xl text-center">

                <div className="mb-4 flex items-center justify-center gap-3">
                <Icon
                    name="solar:cup-star-bold-duotone"
                    width={32}
                    height={32}
                    className="text-amber-300"
                />

                <span className="text-sm font-bold uppercase tracking-[0.35em] text-amber-300/80">
                    Rifa solidaria
                </span>
                </div>

                <h1 className="text-6xl font-black tracking-tight text-white drop-shadow-2xl sm:text-7xl">
                {title}
                </h1>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                {description}
                </p>

            </header>

            <section className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-2">

              <div className="relative aspect-square mx-auto overflow-hidden rounded-3xl">
                <img
                  src={personImage}
                  alt="Maida, deportista de ciclismo"
                  className="h-full w-full object-cover"
                />
                
              </div>

              <PrizeList prizes={prizes} />

            </section>

            <section className="mx-auto mt-6 max-w-6xl">
                <RifaProgress numbers={numbers} />
            </section>

            <section className="mx-auto mt-8 max-w-6xl">

                <div className="mb-4 flex justify-center">

                  <div className="flex items-center gap-3 rounded-full border border-amber-700/70 bg-black/60 px-5 py-2.5 shadow-xl backdrop-blur-md">

                      <Icon
                      name="solar:tag-price-bold-duotone"
                      width={23}
                      height={23}
                      className="text-amber-300"
                      />

                      <span className="text-sm text-white/70">
                      Valor por número
                      </span>

                      <strong className="text-lg font-black text-amber-300">
                      ${price.toLocaleString('es-CL')}
                      </strong>

                  </div>

                </div>

                <NumberBoard
                numbers={numbers}
                onNumberClick={handleNumberClick}
                />

            </section>

            <section className="mx-auto mt-6 max-w-6xl">

                <SelectionSummary
                selectedNumbers={selectedNumbers}
                total={total}
                onClear={handleClearSelection}
                />

                <div className="mt-4">

                <WhatsAppButton
                    selectedNumbers={selectedNumbers}
                    total={total}
                    phoneNumber={phoneNumber}
                />

                </div>

            </section>

            <section className="mx-auto mt-8 max-w-3xl text-center">

                <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">

                <Icon
                    name="solar:info-circle-bold-duotone"
                    width={24}
                    height={24}
                    className="mx-auto text-amber-300"
                />

                <h2 className="mt-2 font-bold text-white">
                    Información del sorteo
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/60">
                    El sorteo finalizará una vez que se complete el
                    tablero de números. Después de seleccionar tus
                    números, comunícate por WhatsApp para coordinar
                    la reserva y el pago.
                </p>

                </div>

            </section>

            <footer className="py-10 text-center text-xs text-white/30">
                RIFA · Apoyo al deporte y al ciclismo
            </footer>

        </div>        
      </div>      
    </main>
  )
}