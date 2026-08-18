import { Icon } from '../Icons/Icon'

interface SelectionSummaryProps {
  selectedNumbers: number[]
  total: number
  onClear: () => void
}

export const SelectionSummary = ({
  selectedNumbers,
  total,
  onClear,
}: SelectionSummaryProps) => {
  return (
    <section className="rounded-3xl border border-amber-900/70 bg-black/60 p-5 shadow-2xl backdrop-blur-md sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-amber-300/70">
            Tu selección
          </p>

          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-3xl font-black text-white">
              ${total.toLocaleString('es-CL')}
            </span>

            <span className="text-sm text-white/50">
              {selectedNumbers.length}{' '}
              {selectedNumbers.length === 1 ? 'número' : 'números'}
            </span>
          </div>

          <p className="mt-1 text-sm text-white/60">
            Toca los números disponibles para elegir.
          </p>
        </div>

        <button
          type="button"
          onClick={onClear}
          disabled={selectedNumbers.length === 0}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-amber-700/70 hover:bg-amber-950/40 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Icon
            name="solar:restart-bold"
            width={19}
            height={19}
          />

          Limpiar selección
        </button>
      </div>

      {selectedNumbers.length > 0 && (
        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-2">
            {selectedNumbers.map((number) => (
              <span
                key={number}
                className="rounded-lg border border-amber-700/60 bg-amber-950/40 px-3 py-1.5 text-sm font-bold text-amber-200"
              >
                #{number}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}