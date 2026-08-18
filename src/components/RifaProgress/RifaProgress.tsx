import { useMemo } from 'react'
import { Icon } from '../Icons/Icon'
import type { RifaNumber } from '../../types/rifa'

interface RifaProgressProps {
  numbers: RifaNumber[]
}

export const RifaProgress = ({
  numbers,
}: RifaProgressProps) => {
  const totalNumbers = numbers.length

  const occupiedNumbers = useMemo(
    () =>
      numbers.filter(
        (item) => item.status === 'sold',
      ).length,
    [numbers],
  )

  const progress = useMemo(
    () =>
      totalNumbers === 0
        ? 0
        : Math.round(
            (occupiedNumbers / totalNumbers) * 100,
          ),
    [occupiedNumbers, totalNumbers],
  )

  const progressColor =
    progress < 25
      ? 'from-emerald-400 to-cyan-400'
      : progress < 50
        ? 'from-cyan-400 to-blue-500'
        : progress < 75
          ? 'from-yellow-300 to-orange-500'
          : progress < 100
            ? 'from-orange-400 to-red-500'
            : 'from-red-500 to-fuchsia-500'

  const progressText =
    progress === 100
      ? '¡Rifa completada!'
      : 'Progreso de la rifa'

  return (
    <section className="rounded-3xl border border-amber-900/70 bg-black/55 p-4 shadow-2xl backdrop-blur-md sm:p-5">

      {/* ENCABEZADO */}
      <div className="mb-3 flex items-center justify-between gap-4">

        <div className="flex items-center gap-2">
          <Icon
            name="solar:chart-2-bold-duotone"
            width={23}
            height={23}
            className="text-amber-300"
          />

          <div>
            <h2 className="text-sm font-bold text-white sm:text-base">
              {progressText}
            </h2>

            <p className="text-xs text-white/50">
              {occupiedNumbers} de {totalNumbers} números ocupados
            </p>
          </div>
        </div>

        <strong className="text-xl font-black text-amber-300 sm:text-2xl">
          {progress}%
        </strong>

      </div>

      {/* BARRA */}
      <div className="relative h-4 overflow-hidden rounded-full border border-white/10 bg-black/60 shadow-inner">

        <div
          className={[
            'h-full rounded-full bg-gradient-to-r',
            'transition-all duration-700 ease-out',
            progressColor,
          ].join(' ')}
          style={{
            width: `${progress}%`,
          }}
        />

        {/* BRILLO */}
        {progress > 0 && progress < 100 && (
          <div
            className="absolute inset-y-0 w-12 animate-pulse rounded-full bg-white/20 blur-md"
            style={{
              left: `calc(${progress}% - 24px)`,
            }}
          />
        )}

      </div>

      {/* TEXTO INFERIOR */}
      <div className="mt-2 flex items-center justify-between text-xs">

        <span className="text-white/40">
          {totalNumbers - occupiedNumbers} números disponibles
        </span>

        <span className="font-semibold text-amber-200/70">
          {progress === 0
            ? '¡Empecemos!'
            : progress === 100
              ? '¡Sorteo completo!'
              : '¡Ya casi!'}
        </span>

      </div>

    </section>
  )
}