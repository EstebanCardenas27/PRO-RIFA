import { useState } from 'react'
import { Icon } from '../Icons/Icon'
import type {
  AdminRifaNumber,
  UpdateNumberStatus,
} from '../../services/api'

interface NumberModalProps {
  number: AdminRifaNumber
  onClose: () => void
  onSave: (
    status: UpdateNumberStatus,
    customerName: string,
    customerPhone: string,
  ) => Promise<void>
}

const STATUS_LABEL: Record<AdminRifaNumber['status'], string> = {
  AVAILABLE: 'Disponible',
  PENDING: 'Pendiente',
  SOLD: 'Vendido',
}

const STATUS_CLASS: Record<AdminRifaNumber['status'], string> = {
  AVAILABLE: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  PENDING: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
  SOLD: 'border-red-500/40 bg-red-500/10 text-red-300',
}

export const NumberModal = ({
  number,
  onClose,
  onSave,
}: NumberModalProps) => {
  const [customerName, setCustomerName] = useState(
    number.customerName ?? '',
  )
  const [customerPhone, setCustomerPhone] = useState(
    number.customerPhone ?? '',
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const hasName = customerName.trim().length > 0
  const hasPhone = customerPhone.trim().length > 0
  const canReserve = hasName && hasPhone

  const handleSave = async (status: UpdateNumberStatus) => {
    setError(null)
    setSaving(true)

    try {
      await onSave(status, customerName.trim(), customerPhone.trim())
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar',
      )
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-700/60 bg-amber-950/30 text-lg font-black text-amber-300">
              {number.number}
            </div>

            <div>
              <h2 className="font-bold text-white">
                Número #{number.number}
              </h2>

              <span
                className={[
                  'mt-0.5 inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold',
                  STATUS_CLASS[number.status],
                ].join(' ')}
              >
                {STATUS_LABEL[number.status]}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <Icon name="solar:close-circle-bold" width={20} height={20} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {number.customerPhone && (
            <a
              href={`https://wa.me/${number.customerPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-green-700/50 bg-green-900/20 px-4 py-2.5 text-sm font-bold text-green-300 transition hover:bg-green-900/30"
            >
              <Icon
                name="logos:whatsapp-icon"
                width={20}
                height={20}
              />

              Contactar por WhatsApp
            </a>
          )}

          <div>
            <label
              htmlFor="customer-name"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/40"
            >
              Nombre del cliente
            </label>

            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Nombre y apellido"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-amber-500/70"
            />
          </div>

          <div>
            <label
              htmlFor="customer-phone"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/40"
            >
              Teléfono (WhatsApp)
            </label>

            <input
              id="customer-phone"
              type="tel"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="+56912345678"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-amber-500/70"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="grid gap-2">
            <button
              type="button"
              disabled={!canReserve || saving}
              onClick={() => handleSave('PENDING')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-600/50 bg-yellow-900/20 px-4 py-3 text-sm font-bold text-yellow-300 transition hover:bg-yellow-900/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon
                name="solar:clock-circle-bold-duotone"
                width={19}
                height={19}
              />

              Marcar como pendiente
            </button>

            <button
              type="button"
              disabled={!canReserve || saving}
              onClick={() => handleSave('SOLD')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-600/50 bg-red-900/20 px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-900/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon
                name="solar:ticket-check-bold-duotone"
                width={19}
                height={19}
              />

              Marcar como vendido
            </button>

            {number.status !== 'AVAILABLE' && (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave('AVAILABLE')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon
                  name="solar:restart-bold"
                  width={19}
                  height={19}
                />

                Liberar número
              </button>
            )}
          </div>

          {!canReserve && number.status === 'AVAILABLE' && (
            <p className="text-center text-xs text-white/40">
              Ingresa nombre y teléfono para reservar o vender el número.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}