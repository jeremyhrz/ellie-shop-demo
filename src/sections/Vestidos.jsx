import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import {
  AnimatePresence,
  cubicBezier,
  interpolate,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion'
import BotonWhatsApp from '../components/BotonWhatsApp'
import Mariposa from '../components/Mariposa'
import Revelar from '../components/Revelar'
import TextoDividido from '../components/TextoDividido'
import { TEXTOS, VESTIDOS, buscarProducto } from '../data/tienda'
import { EXPO, useMenosMovimiento } from '../lib/movimiento'
import { irA } from '../lib/scroll'
import { partirEnfasis, sinEmojis } from '../lib/texto'
import { useVistaRapida } from '../lib/vistaRapida'
import { mensajeProducto } from '../lib/whatsapp'
import { BarraHistoria, CapaFoto, NombreGigante, NumeroRodante } from './vestidos/piezas'
import './vestidos/vestidos.css'

/**
 * «Nuestros vestidos», el momento estrella. Un escenario fijo (sticky) por el que pasan los cuatro
 * vestidos, alrededor de una pantalla de scroll cada uno: la foto se destapa dentro de un arco
 * (el espejo de la tienda), el nombre gigante entra letra a letra y TODA la sección se tiñe del
 * color del vestido que está en pantalla (azul rey → rojo → negro → fucsia). El texto es marfil:
 * contrasta ≥ 6,8:1 con los cuatro fondos.
 */

const N = VESTIDOS.length
const NUMEROS = VESTIDOS.map((v) => v.numero)
const TOTAL = String(N).padStart(2, '0')
const ESPRESSO = '#1A1412' // el de la cinta de arriba: la sección nace de ahí
const PAUSA = 0.2 // fracción de cada tramo en que el vestido se queda quieto

// Avance escalonado: el scroll (0→1) se convierte en t (0→N-1) con una meseta sobre cada vestido.
const ENTRADAS = []
const SALIDAS = []
VESTIDOS.forEach((_, k) => {
  const desde = Math.max(0, k - PAUSA)
  const hasta = Math.min(N - 1, k + PAUSA)
  ENTRADAS.push(desde / (N - 1))
  SALIDAS.push(k)
  if (hasta > desde) {
    ENTRADAS.push(hasta / (N - 1))
    SALIDAS.push(k)
  }
})
const TRAMO = cubicBezier(0.45, 0, 0.25, 1)

const colorDeVestido = interpolate(
  VESTIDOS.map((_, k) => k),
  VESTIDOS.map((v) => v.fondo),
)
const colorDeEntrada = interpolate([0.05, 0.75], [ESPRESSO, VESTIDOS[0].fondo])

// Texto c): el énfasis va como lema en Bodoni; el resto, sin emojis, en Jost.
const TRAMOS_C = partirEnfasis(TEXTOS.vestidos)
const LEMA = TRAMOS_C.find((x) => x.enfasis)?.texto ?? ''
const BAJADA = sinEmojis(
  TRAMOS_C.filter((x) => !x.enfasis)
    .map((x) => x.texto)
    .join(' '),
)

export default function Vestidos() {
  const pista = useRef(null)
  const menos = useMenosMovimiento()
  const { scrollYProgress: entrada } = useScroll({ target: pista, offset: ['start end', 'start start'] })
  const { scrollYProgress: avance } = useScroll({ target: pista, offset: ['start start', 'end end'] })
  const t = useTransform(avance, ENTRADAS, SALIDAS, { ease: TRAMO })
  const fondo = useTransform([entrada, t], ([e, paso]) => (e < 1 ? colorDeEntrada(e) : colorDeVestido(paso)))

  return (
    <motion.section
      id="vestidos"
      aria-labelledby="vestidos-titulo"
      className="sobre-oscuro relative text-marfil"
      style={{ backgroundColor: fondo }}
    >
      <Encabezado />
      <Escenario pista={pista} t={t} entrada={entrada} avance={avance} menos={menos} />
    </motion.section>
  )
}

function Encabezado() {
  return (
    <header className="contenedor pb-12 pt-[var(--aire)] lg:pb-24">
      <Revelar className="flex items-center justify-between border-b border-marfil/20 pb-4" y={12}>
        <p className="etiqueta">La colección</p>
        <p className="etiqueta tabular-nums text-marfil/70">
          01 — {TOTAL}
        </p>
      </Revelar>

      <div className="mt-8 lg:mt-14 lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-8">
        <h2
          id="vestidos-titulo"
          className="font-display text-[clamp(3.6rem,19vw,12.5rem)] font-normal leading-[0.86] tracking-[-0.035em] lg:col-span-8"
        >
          <TextoDividido texto="Nuestros" className="block" />
          <span className="flex items-start pl-[11vw] lg:pl-[12vw]">
            <TextoDividido texto="*vestidos*" claseEnfasis="italic" retraso={0.12} />
            <Mariposa className="ml-[0.06em] mt-[0.02em] w-[0.3em] shrink-0 text-rosa" grosor={1.2} />
          </span>
        </h2>

        <div className="mt-10 lg:col-span-4 lg:mt-0 lg:pb-5">
          <Revelar como="p" retraso={0.15} className="font-display text-[1.75rem] italic leading-[1.08] lg:text-[2.1rem]">
            {LEMA}.
          </Revelar>
          <Revelar como="p" retraso={0.25} className="mt-4 max-w-sm text-[1.0625rem] leading-relaxed text-marfil/80">
            {BAJADA}.
          </Revelar>
        </div>
      </div>
    </header>
  )
}

const FRASE = {
  entra: (dir) => ({ opacity: 0, y: dir >= 0 ? 26 : -26 }),
  quieto: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EXPO, delay: 0.18 } },
  sale: (dir) => ({ opacity: 0, y: dir >= 0 ? -18 : 18, transition: { duration: 0.3, ease: 'easeIn' } }),
}

function Escenario({ pista, t, entrada, avance, menos }) {
  const { abrir } = useVistaRapida()
  const [activo, setActivo] = useState(0)
  const [dir, setDir] = useState(1)
  const [visto, setVisto] = useState(false)
  const [fijo, setFijo] = useState(false)
  const previo = useRef(0)

  useMotionValueEvent(t, 'change', (v) => {
    const i = Math.round(v)
    if (i === previo.current) return
    setDir(i > previo.current ? 1 : -1)
    previo.current = i
    setActivo(i)
  })
  useMotionValueEvent(entrada, 'change', (e) => {
    if (e > 0.45) setVisto(true)
    setFijo(e >= 0.98 && avance.get() < 0.995)
  })
  useMotionValueEvent(avance, 'change', (a) => setFijo(entrada.get() >= 0.98 && a < 0.995))

  // En el teléfono, la barra del navegador (Chrome en Android, Safari) se tiñe del color del
  // vestido mientras el escenario está fijo; al salir vuelve a su color.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta || !fijo) return undefined
    const original = meta.getAttribute('content')
    meta.setAttribute('content', VESTIDOS[activo].fondo)
    return () => meta.setAttribute('content', original)
  }, [fijo, activo])

  const vestido = VESTIDOS[activo]
  const producto = buscarProducto(vestido.producto)

  /** Lleva el scroll a la meseta del vestido k (la barra o el sumario). */
  const irAVestido = (k) => {
    const el = pista.current
    if (!el) return
    const inicio = el.getBoundingClientRect().top + window.scrollY
    irA(inicio + (k / (N - 1)) * (el.offsetHeight - window.innerHeight))
  }

  return (
    <div ref={pista} data-vestidos-pista className="relative h-[450vh]" style={{ height: `${N * 100 + 50}svh` }}>
      <div className="sticky top-0 h-screen overflow-hidden supports-[height:100svh]:h-[100svh]">
        <div className="contenedor flex h-full flex-col pb-5 pt-3 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:py-0">
          {/* Barras tipo historia (teléfono) */}
          <div className="flex items-center gap-4 lg:hidden">
            <p className="flex shrink-0 items-end gap-1.5">
              <span className="sr-only">Vestido </span>
              <NumeroRodante
                t={t}
                numeros={NUMEROS}
                activo={activo}
                menos={menos}
                className="font-display text-[1.65rem] italic tracking-[-0.02em]"
              />
              <span className="etiqueta pb-[0.2em] tabular-nums text-marfil/60">/ {TOTAL}</span>
            </p>
            <div className="flex flex-1 gap-1.5">
              {VESTIDOS.map((v, k) => (
                <BarraHistoria
                  key={v.numero}
                  indice={k}
                  t={t}
                  entrada={entrada}
                  activa={k === activo}
                  etiqueta={`Ver el vestido ${v.numero}: ${v.nombre}`}
                  alTocar={() => irAVestido(k)}
                />
              ))}
            </div>
          </div>

          {/* En el teléfono, arco y ficha van juntos y centrados; en escritorio se reparten la retícula */}
          <div className="flex min-h-0 flex-1 flex-col justify-center lg:contents">
          {/* La foto en su arco, con el nombre gigante entrando y saliendo del espejo */}
          <div className="relative flex items-center justify-center pb-[15vw] pt-4 lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:h-full lg:pb-[13svh] lg:pt-[5svh]">
            <div className="vestidos-arco">
              <NombreGigante
                vestido={visto ? vestido : null}
                dir={dir}
                menos={menos}
                className="absolute bottom-0 left-1/2 z-0 -translate-x-1/2 translate-y-[40%] font-display text-[23vw] leading-none lg:text-[10.4vw]"
              />
              <div className="vestidos-arco__filete z-10" />
              <div className="vestidos-arco__marco z-10 bg-black/20">
                {VESTIDOS.map((v, k) => (
                  <CapaFoto
                    key={v.numero}
                    vestido={v}
                    indice={k}
                    t={t}
                    entrada={entrada}
                    menos={menos}
                    visible={k <= activo}
                  />
                ))}
              </div>
              <NombreGigante
                vestido={visto ? vestido : null}
                dir={dir}
                menos={menos}
                contorno
                className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 translate-y-[40%] font-display text-[23vw] leading-none lg:text-[10.4vw]"
              />
            </div>
          </div>

          {/* Ficha: palabras reales del vestido y botones */}
          <div className="relative z-30 text-center lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:self-center lg:text-left">
            <div className="hidden items-end gap-6 lg:flex">
              <NumeroRodante
                t={t}
                numeros={NUMEROS}
                activo={activo}
                menos={menos}
                className="vestidos-contorno font-display text-[8.5rem] tracking-[-0.04em]"
              />
              <p className="etiqueta pb-3 text-marfil/70">
                Vestido
                <br />
                de {TOTAL}
              </p>
            </div>

            <div className="grid min-h-[1.25em] items-center text-[clamp(1.3rem,6.4vw,1.65rem)] lg:mt-8 lg:min-h-[2.3em] lg:text-[2.6rem]">
              <AnimatePresence custom={dir}>
                {visto && (
                  <motion.p
                    key={vestido.numero}
                    className="font-display italic leading-[1.1] [grid-area:1/1]"
                    custom={dir}
                    variants={FRASE}
                    initial="entra"
                    animate="quieto"
                    exit="sale"
                  >
                    {vestido.palabras}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <p className="sr-only" aria-live="polite">
              {`${producto.nombre}: ${vestido.palabras}`}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5 lg:mt-9 lg:flex lg:gap-3">
              <BotonWhatsApp
                variante="claro"
                mensaje={mensajeProducto({ producto })}
                aria-label={`Lo quiero: pedir el ${producto.nombre} por WhatsApp`}
                className="w-full !px-4 lg:w-auto lg:!px-8"
              >
                Lo quiero
              </BotonWhatsApp>
              <button
                type="button"
                onClick={() => abrir(vestido.producto)}
                aria-label={`Ver detalles del ${producto.nombre}`}
                className="boton boton-linea w-full !px-4 lg:w-auto lg:!px-8"
                data-cursor="Ver"
              >
                Ver detalles
              </button>
            </div>

            {/* Sumario de revista (escritorio) */}
            <ol className="mt-14 hidden border-t border-marfil/20 lg:block">
              {VESTIDOS.map((v, k) => (
                <li key={v.numero} className="border-b border-marfil/20">
                  <button
                    type="button"
                    onClick={() => irAVestido(k)}
                    aria-current={k === activo ? 'true' : undefined}
                    className="group flex w-full items-center gap-5 py-3 text-left"
                  >
                    <span className="etiqueta w-6 tabular-nums text-marfil/70">{v.numero}</span>
                    <span
                      className={clsx(
                        'font-display text-[1.6rem] leading-none transition duration-500 ease-expo',
                        k === activo ? 'translate-x-2 italic text-marfil' : 'text-marfil/45 group-hover:text-marfil/80',
                      )}
                    >
                      {v.nombre}
                    </span>
                    <span
                      className={clsx(
                        'ml-auto h-px w-10 origin-right bg-marfil transition-transform duration-700 ease-expo',
                        k === activo ? 'scale-x-100' : 'scale-x-0',
                      )}
                    />
                  </button>
                </li>
              ))}
            </ol>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
