import { z } from 'zod'

const phonePattern = /^[0-9X+][0-9X\s\-().]{5,20}$/
const imagePattern = /^(?:\/[^"'<>\s]+|https?:\/\/[^\s"'<>]+)$/

export const loginSchema = z.object({
  username: z
    .string({ message: 'El usuario es obligatorio' })
    .trim()
    .min(1, 'El usuario es obligatorio'),
  password: z
    .string({ message: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña es obligatoria'),
})

export const updateNumberSchema = z.object({
  status: z.enum(['AVAILABLE', 'PENDING', 'SOLD'], {
    message: 'Estado inválido',
  }),
  customerName: z.string().trim().min(1).max(200).optional(),
  customerPhone: z
    .string()
    .trim()
    .regex(phonePattern, 'El teléfono tiene un formato inválido')
    .optional(),
})

const prizeSchema = z.object({
  position: z.number({ message: 'La posición de un premio es inválida' }).int().positive(),
  description: z
    .string({ message: 'La descripción de un premio es inválida' })
    .trim()
    .min(1, 'La descripción de un premio es inválida'),
  icon: z
    .string({ message: 'El icono de un premio es inválido' })
    .trim()
    .min(1, 'El icono de un premio es inválido'),
})

export const updateRaffleSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').optional(),
  description: z.string().optional(),
  price: z.number().int().positive('El precio es inválido').optional(),
  raffleDate: z
    .string()
    .datetime({ message: 'La fecha del sorteo es inválida' })
    .optional(),
  backgroundImage: z
    .string()
    .trim()
    .regex(imagePattern, 'La imagen de fondo es inválida')
    .nullable()
    .optional(),
  personImage: z
    .string()
    .trim()
    .regex(imagePattern, 'La imagen de la persona es inválida')
    .nullable()
    .optional(),
  contactWhatsApp: z
    .string()
    .trim()
    .regex(phonePattern, 'El WhatsApp tiene un formato inválido')
    .nullable()
    .optional(),
  active: z.boolean().optional(),
  prizes: z
    .array(prizeSchema)
    .min(1, 'Debe existir al menos un premio')
    .optional(),
})