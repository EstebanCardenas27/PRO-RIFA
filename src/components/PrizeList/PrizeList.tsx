import { Icon } from '../Icons/Icon'
import type { Prize } from '../../types/rifa'

interface PrizeListProps {
  prizes: Prize[]
}

export const PrizeList = ({ prizes }: PrizeListProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-900/70 bg-black/55 p-5 shadow-2xl backdrop-blur-md sm:p-6">
      
      <div className="absolute -right-8 -top-8 opacity-10">
        <Icon
          name="solar:cup-star-bold-duotone"
          width={140}
          height={140}
          className="text-amber-300"
        />
      </div>

      <div className="relative">

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-700/80 bg-amber-900/30">
            <Icon
              name="solar:cup-star-bold-duotone"
              width={25}
              height={25}
              className="text-amber-300"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              Premios
            </h2>

            <p className="text-sm text-amber-200/70">
              Estos son los premios de la rifa
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {prizes.map((prize) => (
            <div
              key={prize.position}
              className="flex items-center gap-4 rounded-2xl border border-amber-900/60 bg-black/30 p-3 transition hover:border-amber-600/70 hover:bg-amber-950/20"
            >

              {/* POSICIÓN */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center text-sm font-black text-amber-200">
                {prize.position}°
              </div>
              
              {/* ICONO DEL PREMIO */} 
              <div className="flex h-11 w-11 shrink-0 items-center justify-center ">
                <Icon
                  name={prize.icon}
                  width={25}
                  height={25}
                  className="text-amber-300"
                />
              </div> 

              {/* DESCRIPCIÓN */}
              <span className="text-sm font-medium text-white sm:text-base">
                {prize.description}
              </span>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}