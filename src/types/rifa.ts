export type NumberStatus = 'available' | 'selected' | 'pending' | 'sold'

export interface RifaNumber {
  id?: number
  number: number
  status: NumberStatus
}

export interface Prize {
  id?: number
  position: number
  description: string
  icon: string
}

export interface Raffle {
  id: number
  title: string
  description: string
  price: number
  raffleDate: string
  backgroundImage: string | null
  personImage: string | null
  contactWhatsApp: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  prizes?: Prize[]
  numbers?: RifaNumber[]
}
