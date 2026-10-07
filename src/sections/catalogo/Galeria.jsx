import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Foto from '../../components/Foto'

/**
 * Galería deslizable de la vista rápida. Scroll-snap nativo (el gesto más fluido del teléfono),
 * indicadores tipo historia y, en escritorio, flechas. `activa` (id de foto) la lleva a esa foto:
 * así el selector de color cambia la imagen. La diapositiva visible lleva data-activa="true"
 * (de ahí sale la foto que vuela a la bolsa) y el carril, data-foto-activa con su id.
 * El carril solo deja al navegador el gesto horizontal (touch-action: pan-x): el vertical queda
 * libre para arrastrar la hoja (onPointerDown llega por `resto`).
 */
export default function Galeria({ fotos, activa, nombre, flechas = false, sizes, className, children, ...resto }) {
  const refCarril = useRef(null)
  const [indice, setIndice] = useState(() => Math.max(0, fotos.indexOf(activa)))
  const primera = useRef(true)

  const ir = (i, suave = true) => {
    const carril = refCarril.current
    if (!carril) return
    carril.scrollTo({ left: i * carril.clientWidth, behavior: suave ? 'smooth' : 'instant' })
  }

  // Al elegir un color (o al abrir con uno), la galería viaja a su foto.
  useEffect(() => {
    const i = fotos.indexOf(activa)
    if (i < 0) return
    ir(i, !primera.current)
    if (primera.current) setIndice(i)
    primera.current = false
  }, [activa, fotos])

  const alDeslizar = () => {
    const carril = refCarril.current
    const i = Math.round(carril.scrollLeft / Math.max(1, carril.clientWidth))
    setIndice((previo) => (previo === i ? previo : Math.min(fotos.length - 1, Math.max(0, i))))
  }

  const varias = fotos.length > 1

  return (
    <div className={clsx('relative overflow-hidden bg-arena', className)} {...resto}>
      <div
        ref={refCarril}
        onScroll={alDeslizar}
        data-galeria=""
        data-foto-activa={fotos[indice]}
        aria-label={`Fotos de ${nombre}`}
        role="group"
        className="cat-sin-barra flex h-full touch-pan-x snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {fotos.map((id, i) => (
          <div
            key={id}
            data-slide=""
            data-activa={i === indice}
            aria-hidden={i !== indice}
            className="relative h-full w-full shrink-0 snap-center snap-always"
          >
            <Foto id={id} rellenar sizes={sizes} prioridad={i === indice} />
          </div>
        ))}
      </div>

      {varias && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
          {fotos.map((id, i) => (
            <span
              key={id}
              className={clsx(
                'h-[3px] w-6 rounded-full shadow-[0_0_6px_rgb(21_18_18/0.25)] transition-colors duration-500',
                i === indice ? 'bg-papel' : 'bg-papel/40',
              )}
            />
          ))}
        </div>
      )}

      {flechas && varias && (
        <>
          <BotonFlecha lado="izquierda" oculto={indice === 0} onClick={() => ir(indice - 1)} />
          <BotonFlecha lado="derecha" oculto={indice === fotos.length - 1} onClick={() => ir(indice + 1)} />
        </>
      )}

      {children}
    </div>
  )
}

function BotonFlecha({ lado, oculto, onClick }) {
  const Icono = lado === 'izquierda' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={oculto}
      aria-label={lado === 'izquierda' ? 'Foto anterior' : 'Foto siguiente'}
      className={clsx(
        'absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-papel/85 text-tinta shadow-md backdrop-blur-sm transition duration-300 hover:bg-papel disabled:pointer-events-none disabled:opacity-0',
        lado === 'izquierda' ? 'left-4' : 'right-4',
      )}
    >
      <Icono className="size-5" strokeWidth={1.5} />
    </button>
  )
}
