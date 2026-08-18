import { Icon } from '../Icons/Icon'

interface WhatsAppButtonProps {
  selectedNumbers: number[]
  total: number
  phoneNumber: string
}

export const WhatsAppButton = ({
  selectedNumbers,
  total,
  phoneNumber,
}: WhatsAppButtonProps) => {
  const isDisabled = selectedNumbers.length === 0

  const message = [
    'Hola, quiero participar en la RIFA a beneficio de Maida.',
    '',
    `Números seleccionados: ${selectedNumbers
      .map((number) => `#${number}`)
      .join(', ')}`,
    `Cantidad: ${selectedNumbers.length}`,
    `Valor total: $${total.toLocaleString('es-CL')}`,
    '',
    'Quedo atento/a para continuar con la reserva.',
  ].join('\n')

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message,
  )}`

  const handleWhatsApp = () => {
    if (isDisabled) {
      return
    }

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleWhatsApp}
      disabled={isDisabled}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-base font-black text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0"
    >
      <Icon
        name="logos:whatsapp-icon"
        width={26}
        height={26}
      />

      {isDisabled
        ? 'Selecciona un número'
        : 'Continuar por WhatsApp'}
    </button>
  )
}