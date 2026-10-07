import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ShoppingBag } from 'lucide-react'
import Foto from '../../components/Foto'
import BotonWhatsApp from '../../components/BotonWhatsApp'
import { TALLAS, buscarProducto } from '../../data/tienda'
import { useBolsa, volarABolsa } from '../../lib/bolsa'
import { useMenosMovimiento } from '../../lib/movimiento'
import { mensajeOutfit } from '../../lib/whatsapp'
import { useInclinacion } from './inclinacion'

const SACUDIDA = [0, -11, 10, -8, 6, -3, 0].map((x) => ({ transform: `translateX(${x}px)` }))
const hexDe = ({ producto, color }) => buscarProducto(producto)?.colores.find((c) => c.nombre === color)?.hex

/**
 * Un outfit real (OUTFITS de tienda.js): tarjeta que se inclina en 3D con el cursor o el dedo,
 * chips de talla, «Agregar a mi bolsa» (las 2 prendas, con su color y la talla elegida; sin
 * talla, la tarjeta vibra y la pide) y «Lo quiero completo» por WhatsApp.
 */
export default function TarjetaOutfit({ outfit, numero }) {
  const menos = useMenosMovimiento()
  const ranura = useInclinacion(!menos)
  const foto = useRef(null)
  const reloj = useRef(0)
  const { agregar, abrir } = useBolsa()
  const [talla, setTalla] = useState(null)
  const [pide, setPide] = useState(false)
  const [listo, setListo] = useState(false)
  const piezas = [outfit.blusa, outfit.short]
  const n = String(numero).padStart(2, '0')

  useEffect(() => () => clearTimeout(reloj.current), [])

  function agregarLook() {
    if (!talla) {
      setPide(true)
      navigator.vibrate?.([14, 50, 14])
      if (!menos) ranura.current?.animate(SACUDIDA, { duration: 480, easing: 'ease-out' })
      return
    }
    // Dos prendas, dos vuelos: el segundo sale un instante después.
    volarABolsa(foto.current)
    if (!menos) setTimeout(() => volarABolsa(foto.current), 160)
    for (const pieza of piezas) agregar({ productoId: pieza.producto, color: pieza.color, talla })
    setListo(true)
    clearTimeout(reloj.current)
    reloj.current = setTimeout(() => setListo(false), 2800)
  }

  return (
    <article
      ref={ranura}
      data-ranura={outfit.id}
      aria-labelledby={`look-${outfit.id}`}
      className="melli-ranura w-[80vw] max-w-[340px] min-[375px]:w-[78vw] shrink-0 snap-center lg:w-auto lg:max-w-none"
    >
      <div className="melli-tarjeta rounded-[30px] bg-papel p-2.5 shadow-[0_34px_60px_-34px_rgb(59_42_34/0.55)] ring-1 ring-tinta/5">
        <div ref={foto} className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
          <Foto id={outfit.foto} rellenar sizes="(min-width: 1024px) 420px, 80vw" />
          <span className="melli-brillo" aria-hidden="true" />
        </div>

        <div className="px-2.5 pb-2.5 pt-5">
          <div className="flex items-start gap-4">
            <h4 id={`look-${outfit.id}`} className="font-display text-[2.1rem] italic leading-none text-camel-titulo">
              <span className="sr-only">Look </span>
              {n}
            </h4>
            <ul className="min-w-0 space-y-1.5 pt-0.5">
              {piezas.map((p) => (
                <li key={p.nombre} className="flex items-center gap-2.5 text-[15px] leading-snug">
                  <span className="size-3 shrink-0 rounded-full ring-1 ring-tinta/15" style={{ backgroundColor: hexDe(p) }} />
                  {p.nombre}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span id={`talla-${outfit.id}`} className="etiqueta">
              Talla
            </span>
            <div
              role="radiogroup"
              aria-labelledby={`talla-${outfit.id}`}
              className={clsx(
                'flex gap-1 rounded-full p-1 transition-shadow duration-300',
                pide ? 'shadow-[0_0_0_2px_var(--camel)]' : 'shadow-[0_0_0_1px_rgb(21_18_18/0.12)]',
              )}
            >
              {TALLAS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={talla === t}
                  data-talla={t}
                  onClick={() => {
                    setTalla(t)
                    setPide(false)
                    navigator.vibrate?.(6)
                  }}
                  className="relative grid size-11 place-items-center rounded-full text-[15px] font-medium"
                >
                  {talla === t && (
                    <motion.span
                      layoutId={`talla-${outfit.id}`}
                      className="absolute inset-0 rounded-full bg-tinta"
                      transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                    />
                  )}
                  <span className={clsx('relative transition-colors duration-300', talla === t ? 'text-papel' : 'text-tinta')}>{t}</span>
                </button>
              ))}
            </div>
          </div>

          <p aria-live="polite" className="mt-2.5 min-h-5 text-[13px] leading-5 text-camel-oscuro" data-aviso>
            {pide && 'Elige tu talla para agregar el look ✦'}
            {!pide && listo && (
              <>
                2 prendas en tu bolsa ·{' '}
                <button type="button" onClick={abrir} className="font-medium underline underline-offset-4">
                  Ver bolsa
                </button>
              </>
            )}
          </p>

          <div className="mt-2 grid gap-2">
            <button type="button" onClick={agregarLook} data-agregar className="boton boton-oscuro w-full !px-4 tracking-[0.1em]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={listo ? 'listo' : 'agregar'}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex items-center gap-2.5"
                >
                  {listo ? <Check className="size-[1.15em]" strokeWidth={1.75} /> : <ShoppingBag className="size-[1.15em]" strokeWidth={1.5} />}
                  {listo ? '¡En tu bolsa!' : 'Agregar a mi bolsa'}
                </motion.span>
              </AnimatePresence>
            </button>
            <BotonWhatsApp mensaje={mensajeOutfit(outfit)} variante="linea" className="w-full !px-4 tracking-[0.1em]">
              Lo quiero completo
            </BotonWhatsApp>
          </div>
        </div>
      </div>
    </article>
  )
}
