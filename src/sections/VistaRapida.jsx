import { useEffect, useId, useRef, useState } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { Check, CreditCard, Share2, ShoppingBag, Truck, X } from 'lucide-react'
import BotonWhatsApp from '../components/BotonWhatsApp'
import { Enfasis } from '../components/TextoDividido'
import { PAGOS, TIENDA, buscarProducto, fotoDe } from '../data/tienda'
import { useBolsa, volarABolsa } from '../lib/bolsa'
import { useAtraparFoco } from '../lib/foco'
import { EXPO, useMenosMovimiento } from '../lib/movimiento'
import { useBloquearScroll } from '../lib/scroll'
import { sinEmojis } from '../lib/texto'
import { enlaceProducto, useVistaRapida } from '../lib/vistaRapida'
import { enlaceWhatsApp, mensajeProducto, mensajeTalla } from '../lib/whatsapp'
import Galeria from './catalogo/Galeria'
import { NOMBRE_CATEGORIA, useMedia } from './catalogo/medios'
import './catalogo/catalogo.css'

/**
 * Vista rápida de un producto. En el teléfono es una hoja que sube desde abajo y se cierra
 * arrastrándola hacia abajo (desde la foto); en escritorio, un modal a dos columnas.
 * Galería deslizable, color (cambia la foto), talla, «Agregar a mi bolsa» (vuela a la bolsa),
 * «Pedir por WhatsApp» y «Compartir». Esc cierra, el foco queda dentro y la página no se mueve.
 * La abre cualquiera con useVistaRapida().abrir(id) o la URL ?p=<id>.
 */
export default function VistaRapida() {
  const { productoId, colorInicial, cerrar } = useVistaRapida()
  const producto = productoId ? buscarProducto(productoId) : null
  const escritorio = useMedia('(min-width: 768px)')
  useBloquearScroll(Boolean(producto))

  return (
    <AnimatePresence>
      {producto && (
        <Panel key={producto.id} producto={producto} colorInicial={colorInicial} alCerrar={cerrar} escritorio={escritorio} />
      )}
    </AnimatePresence>
  )
}

const SALIDA_HOJA = { duration: 0.42, ease: [0.4, 0, 0.9, 0.6] }

function Panel({ producto, colorInicial, alCerrar, escritorio }) {
  const id = useId()
  const refPanel = useRef(null)
  const refTallas = useRef(null)
  const arrastre = useDragControls()
  const menos = useMenosMovimiento()
  const { agregar, abrir: abrirBolsa } = useBolsa()

  const { colores, tallas } = producto
  const varios = colores.length > 1
  const conTallas = tallas.length > 0
  const [color, setColor] = useState(() =>
    colores.some((c) => c.nombre === colorInicial) ? colorInicial : colores[0].nombre,
  )
  const [talla, setTalla] = useState(null)
  const [faltaTalla, setFaltaTalla] = useState(false)
  const [aviso, setAviso] = useState(null) // { tipo: 'bolsa' | 'enlace', n }

  useAtraparFoco(refPanel, true, alCerrar)

  useEffect(() => {
    if (!aviso) return undefined
    const reloj = setTimeout(() => setAviso(null), 4200)
    return () => clearTimeout(reloj)
  }, [aviso])

  const mensaje = mensajeProducto({ producto, color: varios ? color : undefined, talla: talla ?? undefined })

  const agregarABolsa = () => {
    if (conTallas && !talla) {
      setFaltaTalla(true)
      const fila = refTallas.current
      fila?.scrollIntoView({ block: 'nearest', behavior: menos ? 'auto' : 'smooth' })
      if (!menos) {
        fila?.querySelector('[role="radiogroup"]')?.animate(
          [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }],
          { duration: 420, easing: 'ease-out' },
        )
      }
      return
    }
    volarABolsa(refPanel.current?.querySelector('[data-slide][data-activa="true"]'))
    agregar({ productoId: producto.id, color, talla: talla ?? undefined })
    setAviso({ tipo: 'bolsa', n: Date.now() })
  }

  const verBolsa = () => {
    alCerrar()
    abrirBolsa()
  }

  const compartir = async () => {
    const url = enlaceProducto(producto.id)
    if (navigator.share) {
      try {
        await navigator.share({ title: `${producto.nombre} · ${TIENDA.nombre}`, text: `Mira ${producto.articulo} ${producto.nombre} en ${TIENDA.nombre} ✨`, url })
        return
      } catch (error) {
        if (error?.name === 'AbortError') return
      }
    }
    if (await copiar(url)) setAviso({ tipo: 'enlace', n: Date.now() })
  }

  const hoja = !escritorio
  const botonesFoto = (
    <div className="absolute right-3 top-3 z-10 flex gap-2 md:right-5 md:top-5">
      <BotonRedondo etiqueta="Compartir" onClick={compartir}>
        <Share2 className="size-[18px]" strokeWidth={1.5} />
      </BotonRedondo>
      <BotonRedondo etiqueta="Cerrar" onClick={alCerrar}>
        <X className="size-5" strokeWidth={1.5} />
      </BotonRedondo>
    </div>
  )

  return (
    <motion.div className="fixed inset-0 z-modal flex items-end justify-center md:items-center md:p-8 lg:p-12">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-tinta/55"
        onClick={alCerrar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.35 } }}
        transition={{ duration: 0.45 }}
      />

      <motion.div
        ref={refPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-nombre`}
        tabIndex={-1}
        data-vista-rapida={producto.id}
        className={clsx(
          'relative w-full overflow-hidden bg-papel shadow-[0_-24px_60px_-20px_rgb(21_18_18/0.45)] outline-none',
          hoja
            ? 'flex max-h-[94svh] flex-col rounded-t-[28px]'
            : 'grid h-[min(760px,100%)] max-w-[1120px] grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)] rounded-[28px]',
        )}
        initial={hoja ? { y: '100%' } : { opacity: 0, y: 56, scale: 0.97 }}
        animate={hoja ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
        exit={hoja ? { y: '100%', transition: SALIDA_HOJA } : { opacity: 0, y: 32, scale: 0.98, transition: { duration: 0.3 } }}
        transition={{ duration: hoja ? 0.7 : 0.75, ease: EXPO }}
        drag={hoja ? 'y' : false}
        dragControls={arrastre}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.04, bottom: 0.9 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 600) alCerrar()
        }}
      >
        {/* Foto: en el teléfono, también es el asa para arrastrar la hoja hacia abajo. */}
        <Galeria
          fotos={producto.fotos}
          activa={fotoDe(producto, color)}
          nombre={producto.nombre}
          flechas={escritorio}
          sizes="(min-width: 768px) 560px, 100vw"
          className={clsx(hoja ? 'h-[min(50svh,125vw)] shrink-0 touch-pan-x' : 'h-full')}
          onPointerDown={hoja ? (evento) => arrastre.start(evento) : undefined}
        >
          {hoja && (
            <>
              <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-tinta/30 to-transparent" />
              <span aria-hidden="true" className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-papel/90" />
              {botonesFoto}
            </>
          )}
        </Galeria>

        <div className="relative flex min-h-0 flex-1 flex-col">
          {!hoja && botonesFoto}

          <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-6 md:px-10 md:pt-20 lg:px-12">
            <p className="etiqueta text-camel-oscuro">
              {NOMBRE_CATEGORIA[producto.categoria]}
              {producto.etiqueta && <span className="text-tinta/45"> · {producto.etiqueta}</span>}
            </p>
            <h2 id={`${id}-nombre`} className="mt-2.5 font-display text-[2.15rem] leading-[0.98] text-tinta md:text-[3rem] lg:text-[3.4rem]">
              {producto.nombre}
            </h2>
            <p className="mt-3.5 flex items-center gap-2.5 text-[14px] text-tinta/75">
              <span aria-hidden="true" className="cat-latido size-2 shrink-0 rounded-full bg-camel" />
              Consulta disponibilidad por WhatsApp
            </p>
            {producto.descripcion.length <= 40 ? (
              // Las palabras reales de cada vestido («Noche, chic, poder») van como lema.
              <p className="mt-4 font-display text-[1.45rem] italic leading-snug text-camel-oscuro md:text-[1.7rem]">
                {sinEmojis(producto.descripcion)}
              </p>
            ) : (
              <Enfasis como="p" texto={sinEmojis(producto.descripcion)} className="mt-4 text-[15px] leading-relaxed text-tinta/80" />
            )}

            {/* Color */}
            <div className="mt-7">
              <p id={`${id}-color`} className="etiqueta text-tinta/55">
                Color <span className="ml-1 font-display text-[15px] normal-case italic tracking-normal text-tinta">{color}</span>
              </p>
              <div role="radiogroup" aria-labelledby={`${id}-color`} className="mt-3 flex flex-wrap gap-2.5">
                {colores.map((c) => {
                  const elegido = c.nombre === color
                  return (
                    <button
                      key={c.nombre}
                      type="button"
                      role="radio"
                      aria-checked={elegido}
                      aria-label={c.nombre}
                      title={c.nombre}
                      onClick={() => setColor(c.nombre)}
                      className={clsx(
                        'grid size-11 place-items-center rounded-full transition-shadow duration-300',
                        elegido ? 'shadow-[0_0_0_1.5px_var(--tinta)]' : 'shadow-[0_0_0_1px_rgb(21_18_18/0.12)] hover:shadow-[0_0_0_1px_rgb(21_18_18/0.45)]',
                      )}
                    >
                      <span
                        className={clsx('size-8 rounded-full shadow-[inset_0_0_0_1px_rgb(21_18_18/0.14)] transition-transform duration-300', elegido && 'scale-90')}
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Talla (los accesorios no llevan) */}
            {conTallas && (
              <div ref={refTallas} className="mt-7 scroll-mb-6">
                <div className="flex items-baseline justify-between gap-4">
                  <p id={`${id}-talla`} className="etiqueta text-tinta/55">
                    Talla
                  </p>
                  <AnimatePresence>
                    {faltaTalla && !talla && (
                      <motion.p
                        role="alert"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[13px] font-medium text-[#A50F31]"
                      >
                        Elige tu talla para agregarla
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div role="radiogroup" aria-labelledby={`${id}-talla`} className="mt-3 flex gap-2">
                  {tallas.map((t) => {
                    const elegida = t === talla
                    return (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={elegida}
                        onClick={() => setTalla(t)}
                        className={clsx(
                          'h-12 min-w-[3.6rem] rounded-full px-4 text-[14px] font-medium tracking-[0.08em] transition-colors duration-300',
                          elegida
                            ? 'bg-tinta text-papel'
                            : faltaTalla && !talla
                              ? 'text-tinta ring-1 ring-inset ring-[#A50F31]/60'
                              : 'text-tinta ring-1 ring-inset ring-tinta/20 hover:ring-tinta',
                        )}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
                <a
                  href={enlaceWhatsApp(mensajeTalla(producto))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-[44px] items-center text-[13.5px] text-camel-oscuro underline decoration-camel/50 underline-offset-4 transition-colors hover:text-tinta"
                >
                  ¿Dudas con tu talla? Te asesoramos
                </a>
              </div>
            )}

            {/* Lo que sí es real: envíos y Cashea. */}
            <ul className="mt-6 space-y-3 border-t border-tinta/10 pt-6 text-[13.5px] leading-snug text-tinta/70">
              <li className="flex items-start gap-3">
                <Truck aria-hidden="true" className="mt-px size-[18px] shrink-0 text-camel-oscuro" strokeWidth={1.5} />
                {TIENDA.envios}
              </li>
              <li className="flex items-start gap-3">
                <CreditCard aria-hidden="true" className="mt-px size-[18px] shrink-0 text-camel-oscuro" strokeWidth={1.5} />
                {PAGOS.cashea}
              </li>
            </ul>
          </div>

          {/* Acciones, siempre a la vista */}
          <div className="relative shrink-0 border-t border-tinta/10 bg-papel px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 md:px-10 md:pb-9 md:pt-5 lg:px-12">
            <AnimatePresence>
              {aviso && (
                <motion.div
                  key={aviso.n}
                  role="status"
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.45, ease: EXPO }}
                  className="absolute inset-x-4 bottom-[calc(100%+10px)] flex items-center gap-3 rounded-2xl bg-tinta py-2 pl-3 pr-2 text-papel shadow-[0_18px_40px_-14px_rgb(21_18_18/0.55)] md:inset-x-10 lg:inset-x-12"
                >
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-camel text-tinta">
                    <Check className="size-4" strokeWidth={2} />
                  </span>
                  <p className="flex-1 text-[14px]">{aviso.tipo === 'bolsa' ? 'Agregado a tu bolsa' : 'Enlace copiado'}</p>
                  {aviso.tipo === 'bolsa' && (
                    <button
                      type="button"
                      onClick={verBolsa}
                      className="etiqueta min-h-[44px] rounded-full px-3 text-camel transition-colors hover:text-papel"
                    >
                      Ver bolsa
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-2">
              <button type="button" onClick={agregarABolsa} className="boton boton-oscuro w-full">
                <ShoppingBag aria-hidden="true" className="size-[1.2em] shrink-0" strokeWidth={1.5} />
                <span>Agregar a mi bolsa</span>
              </button>
              <BotonWhatsApp mensaje={mensaje} variante="linea" className="w-full">
                Pedir por WhatsApp
              </BotonWhatsApp>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function BotonRedondo({ etiqueta, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      className="grid size-11 place-items-center rounded-full bg-papel/85 text-tinta shadow-[0_6px_18px_-8px_rgb(21_18_18/0.45)] backdrop-blur-sm transition-colors duration-300 hover:bg-papel"
    >
      {children}
    </button>
  )
}


/** Copia un texto al portapapeles (con plan B para navegadores sin la API moderna). */
async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    try {
      const area = Object.assign(document.createElement('textarea'), { value: texto, readOnly: true })
      Object.assign(area.style, { position: 'fixed', opacity: '0', pointerEvents: 'none' })
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch {
      return false
    }
  }
}
