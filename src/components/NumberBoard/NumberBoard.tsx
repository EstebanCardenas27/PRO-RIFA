import { Icon } from '../Icons/Icon'
import type { RifaNumber } from '../../types/rifa'

interface NumberBoardProps {
  numbers: RifaNumber[]
  onNumberClick: (number: number) => void
}

export const NumberBoard = ({
  numbers,
  onNumberClick,
}: NumberBoardProps) => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-900/80 bg-black/40 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-lg sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-black/30" />

      <div className="relative">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Icon
                name="solar:ticket-bold-duotone"
                width={25}
                height={25}
                className="text-amber-300"
              />

              <h2 className="text-xl font-bold text-white">
                Elige tu número
              </h2>
            </div>

            <p className="mt-1 text-sm text-white/60">
              Toca un número disponible para seleccionarlo.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-white/70">Disponible</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="text-white/70">Tu selección</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-white/70">Reservado</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="text-white/70">Ocupado</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:gap-3">
          {numbers.map((item) => {
            const isAvailable = item.status === 'available'
            const isSelected = item.status === 'selected'
            const isPending = item.status === 'pending'
            const isSold = item.status === 'sold'
            const isLocked = isPending || isSold

            return (
              <button
                key={item.number}
                type="button"
                disabled={isLocked}
                onClick={() => onNumberClick(item.number)}
                className={[
                  'relative aspect-square rounded-xl border text-sm font-bold transition-all duration-200 sm:text-base',
                  isAvailable &&
                    'border-emerald-700/60 bg-black/35 text-white hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-950/60 hover:shadow-lg hover:shadow-emerald-950/40',
                  isSelected &&
                    'border-amber-300 bg-amber-400 text-black shadow-lg shadow-amber-900/50',
                  isPending &&
                    'cursor-not-allowed border-yellow-700/60 bg-yellow-950/40 text-yellow-200/60',
                  isSold &&
                    'cursor-not-allowed border-red-950/60 bg-red-950/40 text-red-300/50 line-through',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {item.number}

                {isSelected && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-200 text-black">
                    <Icon
                      name="solar:check-circle-bold"
                      width={15}
                      height={15}
                    />
                  </span>
                )}

                {isPending && (
                  <span className="absolute -right-1 -top-1">
                    <Icon
                      name="solar:clock-circle-bold"
                      width={15}
                      height={15}
                      className="text-yellow-400"
                    />
                  </span>
                )}

                {isSold && (
                  <span className="absolute -right-1 -top-1">
                    <Icon
                      name="solar:lock-keyhole-bold"
                      width={15}
                      height={15}
                      className="text-red-400"
                    />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}