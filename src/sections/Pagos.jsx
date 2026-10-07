import { useRef } from 'react'
import clsx from 'clsx'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MapPin } from 'lucide-react'
import TextoDividido, { Enfasis } from '../components/TextoDividido'
import Revelar from '../components/Revelar'
import Contador from '../components/Contador'
import Mariposa from '../components/Mariposa'
import BotonWhatsApp from '../components/BotonWhatsApp'
import { PAGOS } from '../data/tienda'
import { formatoBs, formatoUsd, useTasaBCV } from '../lib/bcv'
import { EXPO, VISTA, useMenosMovimiento } from '../lib/movimiento'
import './tienda/tienda.css'

/**
 * Cómo comprar (#comprar): Cashea, precios a tasa BCV con la tasa en vivo, envíos y asesoría.
 * Teléfono: las tarjetas se apilan al bajar (sticky) y la tapada se encoge. Escritorio: mosaico.
 */

const MENSAJE_ASESORIA = 'Hola, Ellie 💕 Quiero asesoría personalizada para elegir mi look.'
const MENSAJE_PAGOS = 'Hola, Ellie 💕 ¿Qué métodos de pago aceptan?'

const fechaLarga = new Intl.DateTimeFormat('es-VE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'America/Caracas',
})
const soloNumero = (n) => formatoBs(n).slice(4) // «Bs. 873,87» → «873,87» (el «Bs.» va aparte)

const tarjeta = 'flex h-full min-h-[24rem] flex-col rounded-[1.75rem] p-7 shadow-[0_-18px_40px_-28px_rgb(26_20_18/0.55)] sm:p-9 lg:p-10'
const tituloTarjeta = 'mt-5 font-display text-[2.15rem] leading-[1.02] tracking-[-0.01em] lg:text-[2.75rem]'

/** Destapa de izquierda a derecha al entrar en pantalla (nada con «reducir movimiento»). */
function useDestape(retraso = 0.2) {
  const menos = useMenosMovimiento()
  if (menos) return {}
  return {
    initial: { clipPath: 'inset(0% 100% 0% 0%)' },
    whileInView: { clipPath: 'inset(0% 0% 0% 0%)' },
    viewport: VISTA,
    transition: { duration: 1.3, ease: EXPO, delay: retraso },
  }
}

function Cashea() {
  const destape = useDestape()
  return (
    <article className={clsx(tarjeta, 'bg-rosa text-tinta lg:min-h-[22rem]')}>
      <p className="etiqueta text-cafe">01 · Paga con Cashea</p>
      <h3 className={tituloTarjeta}>
        Llévatelo <em className="enfasis">hoy</em>
      </h3>
      <p className="mt-4 max-w-sm text-tinta/80">{PAGOS.cashea}</p>
      <div className="mt-auto pt-8" aria-hidden="true">
        <div className="flex h-12 gap-1.5">
          <motion.div className="flex flex-[2] items-center rounded-full bg-tinta px-5 text-papel" {...destape}>
            <span className="etiqueta">Hoy</span>
          </motion.div>
          <div className="flex flex-[3] items-center justify-end rounded-full border border-dashed border-tinta/40 px-5">
            <span className="etiqueta text-tinta/60">Cuotas</span>
          </div>
        </div>
        <div className="mt-3 flex justify-between gap-4 text-sm text-tinta/70">
          <span>Pagas una parte</span>
          <span className="text-right">El resto, en cuotas</span>
        </div>
      </div>
    </article>
  )
}

function TasaBCV() {
  const { tasa, fecha, estado } = useTasaBCV()
  const desde = PAGOS.desdeUsd
  return (
    <article className={clsx(tarjeta, 'sobre-oscuro relative overflow-hidden bg-espresso text-marfil')}>
      <div className="flex items-start justify-between gap-4">
        <p className="etiqueta text-camel">02 · Paga en bolívares</p>
        {estado === 'ok' && (
          <p className="etiqueta flex shrink-0 items-center gap-2 text-marfil/70">
            <span className="tienda-envivo" aria-hidden="true" />
            En vivo
          </p>
        )}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 size-[28rem] rounded-full bg-[radial-gradient(closest-side,rgb(181_136_90/0.22),transparent)] lg:-bottom-48 lg:size-[40rem]"
      />
      <Enfasis como="h3" texto="Precios a *tasa BCV*" className={tituloTarjeta} />
      <p className="mt-4 max-w-sm text-marfil/70">Precios en dólares que pagas en bolívares, a la tasa oficial del BCV del día.</p>

      <div className="relative mt-auto min-h-[14.5rem] pt-8 lg:min-h-[17rem]">
        {estado === 'cargando' && (
          <div>
            <span className="sr-only">Consultando la tasa del BCV…</span>
            <div aria-hidden="true">
              <div className="tienda-esqueleto h-3 w-28" />
              <div className="tienda-esqueleto mt-4 h-[clamp(3.6rem,16vw,7.5rem)] w-4/5" />
              <div className="tienda-esqueleto mt-4 h-3 w-44" />
              <div className="tienda-esqueleto mt-7 h-9 w-full" />
            </div>
          </div>
        )}

        {estado === 'ok' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <p className="etiqueta text-marfil/60">Tasa BCV de hoy</p>
            <p className="mt-3 flex items-baseline gap-2 font-display leading-[0.9]">
              <span className="text-[1.6rem] text-camel lg:text-4xl">Bs.</span>
              <Contador valor={tasa} formato={soloNumero} className="text-[clamp(3.6rem,16vw,7.5rem)] tracking-[-0.02em]" />
            </p>
            {fecha?.getTime() > 0 && <p className="mt-3 text-sm text-marfil/60">Vigente: {fechaLarga.format(fecha)}</p>}
            <div className="mt-7 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-marfil/15 pt-5">
              <span className="text-marfil/80">
                Opciones desde <strong className="font-medium text-camel">{formatoUsd(desde)}</strong>
              </span>
              <span className="font-display text-[1.65rem] leading-none">
                ≈ <Contador valor={desde * tasa} formato={formatoBs} retraso={0.35} />
              </span>
            </div>
            <p className="mt-4 text-xs text-marfil/50">Referencial: te confirmamos el total por WhatsApp.</p>
          </motion.div>
        )}

        {estado === 'error' && (
          <div className="relative">
            <p className="font-display text-[2.4rem] leading-none lg:text-6xl">
              Opciones desde <span className="text-camel">{formatoUsd(desde)}</span>
            </p>
            <p className="mt-4 text-marfil/70">Te confirmamos el total en bolívares por WhatsApp.</p>
          </div>
        )}
      </div>
    </article>
  )
}

function Envios() {
  const destape = useDestape(0.15)
  return (
    <article className={clsx(tarjeta, 'bg-papel text-tinta lg:min-h-[22rem]')}>
      <p className="etiqueta text-camel-oscuro">03 · Envíos</p>
      <h3 className={tituloTarjeta}>
        A todo <em className="enfasis">el país</em>
      </h3>
      <p className="mt-4 max-w-sm text-tinta/80">No importa dónde estés: hacemos envíos a nivel nacional.</p>
      <div className="mt-auto pt-8" aria-hidden="true">
        <motion.svg viewBox="0 0 320 64" className="w-full overflow-visible text-camel-oscuro" {...destape}>
          <path
            d="M12 50C70 50 92 14 158 20s96 34 150 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeDasharray="1 8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="50" r="5.5" className="fill-tinta" />
          <circle cx="308" cy="20" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="308" cy="20" r="3.5" fill="currentColor" />
        </motion.svg>
        <div className="mt-3 flex justify-between gap-4">
          <span className="etiqueta flex items-center gap-1.5">
            <MapPin className="size-3.5" strokeWidth={1.75} /> Guacara
          </span>
          <span className="etiqueta">Todo el país</span>
        </div>
      </div>
    </article>
  )
}

function Asesoria() {
  return (
    <article className={clsx(tarjeta, 'sobre-oscuro relative overflow-hidden bg-cafe text-marfil lg:min-h-0 lg:flex-row lg:items-end lg:justify-between lg:gap-10')}>
      <Mariposa className="pointer-events-none absolute right-6 top-6 w-14 text-camel lg:right-10 lg:top-8 lg:w-20" />
      <div>
        <p className="etiqueta text-camel">04 · Asesoría</p>
        <h3 className={clsx(tituloTarjeta, 'pr-16 lg:pr-0')}>
          Asesoría <em className="enfasis">personalizada</em>
        </h3>
        <p className="mt-4 max-w-md text-marfil/75">
          Cuéntanos para qué ocasión es y te ayudamos a elegir tu look y tu talla, prenda por prenda.
        </p>
      </div>
      <div className="mt-auto pt-8 lg:mt-0 lg:shrink-0 lg:pt-0">
        <BotonWhatsApp variante="claro" mensaje={MENSAJE_ASESORIA} magnetico>
          Pide tu asesoría
        </BotonWhatsApp>
      </div>
    </article>
  )
}

const TARJETAS = [
  { Tarjeta: Cashea, clase: 'lg:col-span-5' },
  { Tarjeta: TasaBCV, clase: 'lg:col-span-7 lg:row-span-2' },
  { Tarjeta: Envios, clase: 'lg:col-span-5' },
  { Tarjeta: Asesoria, clase: 'lg:col-span-12' },
]

/** Envoltura pegajosa (solo teléfono) que se encoge a medida que la tapan las siguientes. */
function Apilada({ indice, progreso, menos, clase, children }) {
  const total = TARJETAS.length
  const escala = useTransform(progreso, [indice / total, 1], [1, 1 - (total - 1 - indice) * 0.045])
  return (
    <motion.div
      className={clsx('tienda-pila sticky mb-4 last:mb-0 lg:static lg:mb-0', clase)}
      style={{ top: `calc(5rem + ${indice} * 0.875rem)`, '--escala': menos ? 1 : escala }}
    >
      <Revelar y={48} className="h-full">
        {children}
      </Revelar>
    </motion.div>
  )
}

export default function Pagos() {
  const menos = useMenosMovimiento()
  const pila = useRef(null)
  const { scrollYProgress } = useScroll({ target: pila, offset: ['start start', 'end start'] })

  return (
    <section id="comprar" className="seccion bg-arena" aria-labelledby="comprar-titulo">
      <div className="contenedor">
        <header className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="etiqueta mb-5 text-camel-oscuro">Cómo comprar</p>
            <TextoDividido como="h2" id="comprar-titulo" texto="Comprar en Ellie es *fácil*" className="titulo-display" />
          </div>
          <Revelar retraso={0.15} className="max-w-md text-lg text-tinta/80 lg:col-span-5 lg:justify-self-end">
            <Enfasis como="p" texto="Ya no tienes que ir tan lejos: tus prendas favoritas *a tasa BCV* y *con Cashea*." />
          </Revelar>
        </header>

        <div ref={pila} className="relative lg:grid lg:grid-cols-12 lg:gap-5">
          {TARJETAS.map(({ Tarjeta, clase }, i) => (
            <Apilada key={i} indice={i} progreso={scrollYProgress} menos={menos} clase={clase}>
              <Tarjeta />
            </Apilada>
          ))}
        </div>

        <Revelar className="mt-12 flex flex-col items-start gap-5 border-t border-tinta/15 pt-8 sm:flex-row sm:items-center sm:justify-between lg:mt-16">
          <p className="font-display text-[1.85rem] leading-tight lg:text-4xl">
            ¿Otros métodos de pago? <em className="enfasis">Pregúntanos.</em>
          </p>
          <BotonWhatsApp variante="linea" mensaje={MENSAJE_PAGOS}>
            Escríbenos
          </BotonWhatsApp>
        </Revelar>
      </div>
    </section>
  )
}
