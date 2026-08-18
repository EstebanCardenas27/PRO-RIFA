import { useState } from 'react'
import { Icon } from '../../components/Icons/Icon'
import type {
  AdminRaffle,
  UpdateRafflePayload,
} from '../../services/api'

interface SettingsProps {
  raffle: AdminRaffle
  onSave: (payload: UpdateRafflePayload) => Promise<AdminRaffle>
}

interface PrizeForm {
  position: number
  description: string
  icon: string
}

function toLocalInputValue(iso: string): string {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const Settings = ({ raffle, onSave }: SettingsProps) => {
  const [title, setTitle] = useState(raffle.title)
  const [description, setDescription] = useState(raffle.description)
  const [price, setPrice] = useState(String(raffle.price))
  const [raffleDate, setRaffleDate] = useState(
    toLocalInputValue(raffle.raffleDate),
  )
  const [whatsapp, setWhatsapp] = useState(raffle.contactWhatsApp ?? '')
  const [backgroundImage, setBackgroundImage] = useState(
    raffle.backgroundImage ?? '',
  )
  const [personImage, setPersonImage] = useState(
    raffle.personImage ?? '',
  )
  const [prizes, setPrizes] = useState<PrizeForm[]>(
    raffle.prizes.map((prize) => ({
      position: prize.position,
      description: prize.description,
      icon: prize.icon,
    })),
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [syncedAt, setSyncedAt] = useState(raffle.updatedAt)

  if (raffle.updatedAt !== syncedAt) {
    setSyncedAt(raffle.updatedAt)
    setTitle(raffle.title)
    setDescription(raffle.description)
    setPrice(String(raffle.price))
    setRaffleDate(toLocalInputValue(raffle.raffleDate))
    setWhatsapp(raffle.contactWhatsApp ?? '')
    setBackgroundImage(raffle.backgroundImage ?? '')
    setPersonImage(raffle.personImage ?? '')
    setPrizes(
      raffle.prizes.map((prize) => ({
        position: prize.position,
        description: prize.description,
        icon: prize.icon,
      })),
    )
    setError(null)
    setSaved(false)
  }

  const handleSave = async () => {
    const parsedPrice = Number(price)
    const parsedDate = new Date(raffleDate)

    if (!title.trim()) {
      setError('El título es obligatorio')
      return
    }
    if (!Number.isInteger(parsedPrice) || parsedPrice <= 0) {
      setError('El precio debe ser un número entero mayor a 0')
      return
    }
    if (Number.isNaN(parsedDate.getTime())) {
      setError('La fecha del sorteo es inválida')
      return
    }
    if (prizes.length === 0 || prizes.some((p) => !p.description.trim())) {
      setError('Debe existir al menos un premio con descripción')
      return
    }

    setError(null)
    setSaving(true)

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        raffleDate: parsedDate.toISOString(),
        backgroundImage: backgroundImage.trim() || null,
        personImage: personImage.trim() || null,
        contactWhatsApp: whatsapp.trim() || null,
        prizes: prizes.map((prize) => ({
          position: prize.position,
          description: prize.description.trim(),
          icon: prize.icon.trim() || 'solar:gift-bold-duotone',
        })),
      })
      setSaved(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async () => {
    const closing = raffle.active
    const confirmed = window.confirm(
      closing
        ? '¿Cerrar la rifa? Dejará de aparecer en la página pública.'
        : '¿Reabrir la rifa en la página pública?',
    )

    if (!confirmed) {
      return
    }

    setError(null)
    setSaving(true)

    try {
      await onSave({ active: !closing })
      setSaved(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo actualizar',
      )
    } finally {
      setSaving(false)
    }
  }

  const updatePrize = (index: number, field: keyof PrizeForm, value: string) => {
    setPrizes((current) =>
      current.map((prize, i) =>
        i === index ? { ...prize, [field]: value } : prize,
      ),
    )
  }

  const addPrize = () => {
    setPrizes((current) => [
      ...current,
      {
        position: current.length + 1,
        description: '',
        icon: 'solar:gift-bold-duotone',
      },
    ])
  }

  const removePrize = (index: number) => {
    setPrizes((current) =>
      current
        .filter((_, i) => i !== index)
        .map((prize, i) => ({ ...prize, position: i + 1 })),
    )
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-amber-500/70'

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* DATOS DE LA RIFA */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="font-bold">Datos de la rifa</h2>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="raffle-title"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/40"
            >
              Título
            </label>

            <input
              id="raffle-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="raffle-description"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/40"
            >
              Descripción
            </label>

            <textarea
              id="raffle-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="raffle-price"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/40"
              >
                Precio por número (CLP)
              </label>

              <input
                id="raffle-price"
                type="number"
                min="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="raffle-date"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/40"
              >
                Fecha del sorteo
              </label>

              <input
                id="raffle-date"
                type="datetime-local"
                value={raffleDate}
                onChange={(event) => setRaffleDate(event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="raffle-whatsapp"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/40"
            >
              WhatsApp de contacto (formato internacional)
            </label>

            <input
              id="raffle-whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
              placeholder="569XXXXXXXX"
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="raffle-background"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/40"
              >
                Imagen de fondo
              </label>

              <input
                id="raffle-background"
                type="text"
                value={backgroundImage}
                onChange={(event) => setBackgroundImage(event.target.value)}
                placeholder="/background.jpg"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="raffle-person"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white/40"
              >
                Imagen de la persona
              </label>

              <input
                id="raffle-person"
                type="text"
                value={personImage}
                onChange={(event) => setPersonImage(event.target.value)}
                placeholder="/maida.svg"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PREMIOS */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Premios</h2>

          <button
            type="button"
            onClick={addPrize}
            className="flex items-center gap-1.5 rounded-lg border border-amber-700/50 bg-amber-900/20 px-3 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-900/30"
          >
            <Icon name="solar:add-circle-bold" width={16} height={16} />

            Agregar
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {prizes.map((prize, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-xl border border-white/10 bg-black/30 p-3 sm:grid-cols-[52px_1fr_1fr_36px]"
            >
              <div className="flex items-center justify-center rounded-lg border border-white/10 bg-black/40 text-sm font-black text-amber-300">
                {prize.position}°
              </div>

              <input
                type="text"
                value={prize.description}
                onChange={(event) =>
                  updatePrize(index, 'description', event.target.value)
                }
                placeholder="Descripción del premio"
                className={inputClass}
              />

              <input
                type="text"
                value={prize.icon}
                onChange={(event) =>
                  updatePrize(index, 'icon', event.target.value)
                }
                placeholder="Icono (ej: solar:gift-bold-duotone)"
                className={inputClass}
              />

              <button
                type="button"
                onClick={() => removePrize(index)}
                aria-label="Eliminar premio"
                className="flex items-center justify-center rounded-lg border border-white/10 text-white/50 transition hover:bg-red-900/20 hover:text-red-300"
              >
                <Icon name="solar:trash-bin-trash-bold" width={17} height={17} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ERROR / GUARDAR */}
      <div className="lg:col-span-2">
        {error && (
          <p className="rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {saved && !error && (
          <p className="rounded-xl border border-emerald-700/60 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-300">
            Cambios guardados correctamente.
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <Icon name="solar:diskette-bold-duotone" width={19} height={19} />

          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {/* ZONA DE RIESGO */}
      <div className="rounded-2xl border border-red-500/30 bg-red-950/10 p-5 lg:col-span-2">
        <h3 className="font-bold text-red-300">Zona de riesgo</h3>

        <p className="mt-1 text-sm text-white/50">
          Al cerrar la rifa, deja de aparecer en la página pública. Puedes
          reabrirla en cualquier momento desde aquí.
        </p>

        <button
          type="button"
          onClick={handleToggleActive}
          disabled={saving}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-600/50 bg-red-900/20 px-5 py-3 text-sm font-bold text-red-300 transition hover:bg-red-900/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon
            name={
              raffle.active
                ? 'solar:lock-keyhole-minimalistic-bold'
                : 'solar:unlock-keyhole-minimalistic-bold'
            }
            width={19}
            height={19}
          />

          {raffle.active ? 'Cerrar la rifa' : 'Reabrir la rifa'}
        </button>
      </div>
    </div>
  )
}