import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icons/Icon'

export const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">

      <section className="text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-700/60 bg-amber-950/30">
          <Icon
            name="solar:question-square-bold-duotone"
            width={40}
            height={40}
            className="text-amber-300"
          />
        </div>

        <p className="mt-6 text-sm font-bold uppercase tracking-[0.3em] text-amber-300">
          404
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Página no encontrada
        </h1>

        <p className="mt-3 text-sm text-white/50">
          La página que buscas no existe o fue movida.
        </p>

        <Link
          to="/rifa"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-700/60 bg-amber-900/30 px-5 py-3 text-sm font-bold text-amber-200 transition hover:bg-amber-800/40"
        >
          <Icon
            name="solar:home-2-bold-duotone"
            width={19}
            height={19}
          />

          Volver a la rifa
        </Link>

      </section>

    </main>
  )
}