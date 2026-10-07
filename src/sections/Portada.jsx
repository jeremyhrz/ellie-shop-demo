import { useRef } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import BotonWhatsApp from '../components/BotonWhatsApp'
import Logo from '../components/Logo'
import Magnetico from '../components/Magnetico'
import Mariposa from '../components/Mariposa'
import TextoDividido, { Enfasis } from '../components/TextoDividido'
import { PAGOS, TIENDA } from '../data/tienda'
import { useIntroTerminada } from '../lib/intro'
import { EXPO } from '../lib/movimiento'
import { irA } from '../lib/scroll'
import PilaHistorias from './portada/PilaHistorias'
import './portada/portada.css'

// La bio real, con sus dos palabras protagonistas en cursiva camel.
const TITULAR = TIENDA.bio.replace('belleza', '*belleza*').replace('seguridad', '*seguridad*')

// Texto d) de sus publicaciones, resumido.
const BAJADA =
  'La boutique de ropa para dama más linda de Guacara. Opciones para toda ocasión, asesoría personalizada y, lo mejor de todo, *¡contamos con Cashea!*'

const CHIPS = [
  {
    clase: 'left-[-13%] top-[13%] lg:left-[-24%]',
    variante: '',
    contenido: (
      <>
        Opciones desde <em className="font-display text-[1.3em] font-medium not-italic leading-none text-camel-oscuro">${PAGOS.desdeUsd}</em>
      </>
    ),
  },
  {
    clase: 'right-[-13%] top-[47%] lg:right-[-22%]',
    variante: 'portada-chip--b',
    contenido: (
      <>
        Paga con <strong className="font-semibold">Cashea</strong>
      </>
    ),
  },
  {
    clase: 'bottom-[9%] left-[-9%] lg:left-[-18%]',
    variante: 'portada-chip--c',
    contenido: 'Envíos a todo el país',
  },
]

/**
 * Portada (#inicio): la bio de Ellie enorme, revelada por palabras cuando termina la intro, y una
 * pila de historias reales que se baraja sola y se puede arrastrar.
 */
export default function Portada() {
  const listo = useIntroTerminada()
  const seccion = useRef(null)

  const entrar = (retraso) => ({
    initial: { opacity: 0, y: 26 },
    animate: listo ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1.05, ease: EXPO, delay: retraso },
  })

  const bajar = () => {
    const caja = seccion.current?.getBoundingClientRect()
    if (caja) irA(caja.bottom + window.scrollY)
  }

  return (
    <section id="inicio" ref={seccion} className="relative isolate overflow-x-clip bg-marfil">
      <div className="contenedor portada-reticula relative pb-16 pt-[5.25rem] lg:min-h-[100svh] lg:pb-28 lg:pt-28">
        <div className="portada-titular relative z-10 lg:self-end">
          <motion.p {...entrar(0)} className="etiqueta flex items-center gap-3 text-camel-oscuro">
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            Boutique para dama · Guacara
          </motion.p>
          <TextoDividido
            como="h1"
            texto={TITULAR}
            alVer={false}
            animate={listo ? 'visible' : 'oculto'}
            retraso={0.1}
            escalon={0.065}
            duracion={1.1}
            className="titulo-display text-portada mt-4 text-tinta lg:mt-6 lg:text-[clamp(4.75rem,7.3vw,8.25rem)]"
          />
        </div>

        <div className="portada-pila relative mt-9 lg:mt-0">
          <PilaHistorias listo={listo} className="mx-auto w-[min(57vw,262px)] lg:w-[clamp(250px,22vw,330px)]">
            {/* Rubor y la palabra «ellie» de fondo */}
            <div aria-hidden="true" className="portada-rubor pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[175%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[56%] -z-10 hidden w-[230%] -translate-x-1/2 -translate-y-1/2 text-arena lg:block"
              initial={{ opacity: 0 }}
              animate={listo ? { opacity: 1 } : undefined}
              transition={{ duration: 1.6, delay: 0.5 }}
            >
              <Logo variante="palabra" titulo={null} className="h-auto w-full" />
            </motion.div>

            {CHIPS.map((chip, i) => (
              <motion.div
                key={i}
                aria-hidden="true"
                className={clsx('pointer-events-none absolute z-20', chip.clase)}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={listo ? { opacity: 1, scale: 1 } : undefined}
                transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 1.05 + i * 0.16 }}
              >
                <div
                  className={clsx(
                    'portada-chip flex items-center gap-2 whitespace-nowrap rounded-full bg-papel/90 py-2 pl-3 pr-3.5 text-[12px] font-medium text-tinta shadow-[0_12px_30px_-12px_rgb(26_20_18/0.4)] ring-1 ring-tinta/[0.06] backdrop-blur-sm lg:py-2.5 lg:pl-3.5 lg:pr-4 lg:text-[13px]',
                    chip.variante,
                  )}
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-camel" />
                  <span>{chip.contenido}</span>
                </div>
              </motion.div>
            ))}

            {listo && (
              <div aria-hidden="true" className="portada-vuelo pointer-events-none absolute -right-[16%] -top-[9%] z-20 w-11 lg:-right-[24%] lg:w-14">
                <Mariposa animado retraso={1.25} className="w-full text-camel-oscuro" />
              </div>
            )}

            {/* Indicador de scroll del teléfono, a la izquierda de la pila */}
            <IndicadorScroll listo={listo} alPulsar={bajar} vertical className="absolute bottom-0 left-[calc(-50vw+50%+20px)] lg:hidden" />
          </PilaHistorias>
        </div>

        <div className="portada-bajada relative z-10 mt-10 lg:mt-9 lg:self-start">
          <motion.div {...entrar(0.5)}>
            <Enfasis como="p" texto={BAJADA} className="max-w-[27rem] text-[15px] leading-[1.65] text-cafe lg:text-[17px]" />
          </motion.div>
          <motion.div {...entrar(0.62)} className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-9">
            <Magnetico className="w-full sm:w-auto">
              <a
                href="#catalogo"
                onClick={(evento) => {
                  evento.preventDefault()
                  irA('#catalogo')
                }}
                className="boton boton-oscuro group w-full sm:w-auto"
              >
                <span>Ver la colección</span>
                <ArrowRight className="size-4 transition-transform duration-500 ease-expo group-hover:translate-x-1" strokeWidth={1.6} aria-hidden="true" />
              </a>
            </Magnetico>
            <Magnetico className="w-full sm:w-auto">
              <BotonWhatsApp variante="linea" className="w-full sm:w-auto" />
            </Magnetico>
          </motion.div>
        </div>
      </div>

      <IndicadorScroll
        listo={listo}
        alPulsar={bajar}
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 lg:flex"
      />
    </section>
  )
}

/** «Descubre» con una gota que baja por un hilo; al pulsarlo, baja a la sección siguiente. */
function IndicadorScroll({ listo, alPulsar, vertical = false, className }) {
  return (
    <div className={className}>
      <motion.button
        type="button"
        onClick={alPulsar}
        aria-label="Bajar a la siguiente sección"
        className="flex flex-col items-center gap-3 text-cafe/80 transition-colors hover:text-camel-oscuro"
        initial={{ opacity: 0 }}
        animate={listo ? { opacity: 1 } : undefined}
        transition={{ duration: 0.9, delay: 1.5 }}
      >
        <span className={clsx('etiqueta text-[10px]', vertical && 'portada-vertical')}>Descubre</span>
        <span aria-hidden="true" className="portada-scroll__hilo" />
      </motion.button>
    </div>
  )
}
