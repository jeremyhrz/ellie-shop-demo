import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import Foto from '../../components/Foto'
import { buscarProducto } from '../../data/tienda'
import { EXPO, useMenosMovimiento } from '../../lib/movimiento'

const MELLI = buscarProducto('short-melli')
// Arranca suave desde la muestra y barre la foto: el círculo se ve nacer (con expo puro ya
// cubría casi todo en 0,3 s y el gesto no se apreciaba).
const CURVA = 'cubic-bezier(0.6, 0, 0.2, 1)'
const dos = (n) => String(n).padStart(2, '0')

/**
 * Probador del Short Melli: una foto por color (tienda.js → colores[].foto), apiladas. Al tocar
 * una muestra, primero una ola del color de la tela y detrás la foto nueva se destapan en círculo
 * (clip-path: circle) desde el centro de la muestra tocada. Mientras nadie lo toca y está a la
 * vista, cambia solo cada 3 s para enseñar el gesto. Con «reducir movimiento»: fundido corto.
 */
export default function Probador({ className }) {
  const colores = MELLI.colores
  const menos = useMenosMovimiento()
  const [activo, setActivo] = useState(0)
  const [tocado, setTocado] = useState(false)
  const actual = useRef(0)
  const escenario = useRef(null)
  const capas = useRef([])
  const muestras = useRef([])
  const tinta = useRef(null)
  const z = useRef(10)
  const enVista = useInView(escenario, { amount: 0.55 })

  function revelar(i) {
    const capa = capas.current[i]
    if (menos) {
      capa.style.zIndex = String(++z.current)
      capa.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' })
      return
    }
    const caja = escenario.current.getBoundingClientRect()
    const m = muestras.current[i].getBoundingClientRect()
    const x = m.left + m.width / 2 - caja.left
    const y = m.top + m.height / 2 - caja.top
    const r = Math.hypot(Math.max(x, caja.width - x), Math.max(y, caja.height - y)) + 2
    const fotogramas = [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)` }]

    const ola = tinta.current
    ola.style.backgroundColor = colores[i].hex
    ola.style.zIndex = String(++z.current)
    capa.style.zIndex = String(++z.current)
    ola.animate(fotogramas, { duration: 900, easing: CURVA, fill: 'forwards' })
    const destape = capa.animate(fotogramas, { duration: 1150, delay: 140, easing: CURVA, fill: 'both' })
    // Al terminar suelta el círculo: si luego cambia el tamaño de la ventana, la foto sigue entera.
    destape.onfinish = () => destape.cancel()
  }

  function elegir(i, delUsuario = true) {
    if (delUsuario) {
      setTocado(true)
      navigator.vibrate?.(8)
      muestras.current[i]?.querySelector('.melli-onda')?.animate(
        [
          { transform: 'scale(0.9)', opacity: 0.9 },
          { transform: 'scale(1.75)', opacity: 0 },
        ],
        { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      )
    }
    if (i === actual.current) return
    actual.current = i
    setActivo(i)
    revelar(i)
  }

  // Demostración: mientras está a la vista y nadie la ha tocado, cambia sola.
  useEffect(() => {
    if (!enVista || tocado || menos) return undefined
    const reloj = setInterval(() => elegir((actual.current + 1) % colores.length, false), 3000)
    return () => clearInterval(reloj)
  }, [enVista, tocado, menos])

  const color = colores[activo]

  return (
    <div className={clsx('relative isolate', className)}>
      {/* Halo del color elegido detrás de la foto (degradado enmascarado, sin filtros). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 opacity-30 transition-colors duration-700 [mask-image:radial-gradient(closest-side,#000,transparent)]"
        style={{ backgroundColor: color.hex }}
      />

      <div
        ref={escenario}
        data-color-activo={color.nombre}
        data-foto-activa={color.foto}
        className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-arena shadow-[0_40px_70px_-35px_rgb(59_42_34/0.55)]"
      >
        <div className="absolute inset-0 isolate">
          {colores.map((c, i) => (
            <div
              key={c.nombre}
              ref={(el) => (capas.current[i] = el)}
              className="melli-capa"
              style={{ zIndex: i === 0 ? 10 : 1 }}
              aria-hidden={i !== activo}
              data-capa={c.foto}
            >
              <Foto id={c.foto} rellenar sizes="(min-width: 1024px) 540px, 92vw" alt={i === activo ? undefined : ''} />
            </div>
          ))}
          <div ref={tinta} className="melli-capa" aria-hidden="true" style={{ clipPath: 'circle(0px at 50% 100%)' }} />
        </div>

        <AnimatePresence>
          {!tocado && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EXPO }}
              className="etiqueta absolute left-4 top-4 z-10 flex items-center gap-2.5 rounded-full bg-papel/85 px-3.5 py-2 text-tinta shadow-sm backdrop-blur"
            >
              <span className="relative grid size-2 place-items-center">
                <span className="melli-latido absolute inset-0 rounded-full bg-camel" />
                <span className="relative size-2 rounded-full bg-camel" />
              </span>
              Toca un color
            </motion.p>
          )}
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
          <div
            role="radiogroup"
            aria-label="Color del Short Melli"
            className="flex items-center gap-2 rounded-full bg-papel/80 p-1.5 shadow-[0_12px_30px_-12px_rgb(21_18_18/0.45)] backdrop-blur-md"
          >
            {colores.map((c, i) => (
              <motion.button
                key={c.nombre}
                ref={(el) => (muestras.current[i] = el)}
                type="button"
                role="radio"
                aria-checked={i === activo}
                aria-label={c.nombre}
                data-muestra={c.nombre}
                onClick={() => elegir(i)}
                whileTap={{ scale: 0.84 }}
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 520, damping: 26 }}
                className="relative grid size-12 place-items-center rounded-full"
              >
                {i === activo && (
                  <motion.span
                    layoutId="melli-anillo"
                    className="absolute inset-0 rounded-full ring-[1.5px] ring-tinta"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="melli-muestra relative size-9 rounded-full" style={{ backgroundColor: c.hex, color: c.hex }}>
                  <span className="melli-onda" />
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="etiqueta text-camel-oscuro">Color</p>
          <p className="relative mt-1 h-[1.2em] overflow-hidden font-display text-[2.6rem] italic leading-[1.1] lg:text-5xl" aria-live="polite">
            <AnimatePresence initial={false}>
              <motion.span
                key={color.nombre}
                className="absolute inset-x-0 top-0 whitespace-nowrap"
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                exit={{ y: '-110%' }}
                transition={{ duration: 0.75, ease: EXPO }}
              >
                {color.nombre}
              </motion.span>
            </AnimatePresence>
          </p>
        </div>
        <p className="etiqueta pb-2 tabular-nums text-tinta/60" aria-hidden="true">
          {dos(activo + 1)} / {dos(colores.length)}
        </p>
      </div>
    </div>
  )
}
