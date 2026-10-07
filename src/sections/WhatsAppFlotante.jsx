import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import Mariposa from '../components/Mariposa'
import { IconoWhatsApp } from '../components/Iconos'
import { useBolsa } from '../lib/bolsa'
import { useVistaRapida } from '../lib/vistaRapida'
import { enlaceWhatsApp, mensajeGeneral, mensajeTalla } from '../lib/whatsapp'
import { EXPO, useMenosMovimiento } from '../lib/movimiento'
import './bolsa/bolsa.css'

const CLAVE_BURBUJA = 'ellie:burbuja-talla' // sessionStorage: la clienta ya cerró la burbuja
const MENSAJE_TALLA = mensajeTalla()
const ESPERA_BURBUJA = 6000
const DURACION_BURBUJA = 9000

function burbujaYaCerrada() {
  try {
    return window.sessionStorage.getItem(CLAVE_BURBUJA) === '1'
  } catch {
    return false
  }
}

function recordarBurbujaCerrada() {
  try {
    window.sessionStorage.setItem(CLAVE_BURBUJA, '1')
  } catch {
    // sin sessionStorage: se cierra igual, solo que no se recuerda
  }
}

/**
 * true cuando ya se pasó la portada (#inicio) o, si no existe, tras 0,8 pantallas de scroll.
 * Se mide en un rAF por evento de scroll (pasivo): nada de trabajo por cuadro si nadie se mueve.
 */
function usePasoPortada() {
  const [paso, setPaso] = useState(false)
  useEffect(() => {
    let cuadro = 0
    const medir = () => {
      cuadro = 0
      const alto = window.innerHeight
      const inicio = document.getElementById('inicio')
      setPaso(inicio ? inicio.getBoundingClientRect().bottom < alto * 0.4 : window.scrollY > alto * 0.8)
    }
    const pedir = () => {
      if (!cuadro) cuadro = window.requestAnimationFrame(medir)
    }
    medir()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      window.cancelAnimationFrame(cuadro)
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
    }
  }, [])
  return paso
}

/**
 * Botón flotante de WhatsApp: aparece al pasar la portada con un latido suave y la mariposa
 * posada encima. A los ~6 s ofrece ayuda con la talla en una burbuja que se puede cerrar (y se
 * recuerda en la sesión). Se aparta cuando la bolsa o la vista rápida están abiertas.
 */
export default function WhatsAppFlotante() {
  const { abierta } = useBolsa()
  const { productoId } = useVistaRapida()
  const paso = usePasoPortada()
  const visible = paso && !abierta && !productoId

  const [aparecio, setAparecio] = useState(false)
  const [hora, setHora] = useState(false) // ya pasaron los ~6 s
  const [cerrada, setCerrada] = useState(burbujaYaCerrada)

  useEffect(() => {
    if (visible) setAparecio(true)
  }, [visible])

  useEffect(() => {
    if (!aparecio || cerrada) return undefined
    const reloj = window.setTimeout(() => setHora(true), ESPERA_BURBUJA)
    return () => window.clearTimeout(reloj)
  }, [aparecio, cerrada])

  const cerrarBurbuja = () => {
    setCerrada(true)
    recordarBurbujaCerrada()
  }

  // En el teléfono la burbuja tapa contenido: se retira sola a los ~9 s (y ya no vuelve en la sesión).
  useEffect(() => {
    if (!hora || cerrada) return undefined
    const reloj = window.setTimeout(() => {
      setCerrada(true)
      recordarBurbujaCerrada()
    }, DURACION_BURBUJA)
    return () => window.clearTimeout(reloj)
  }, [hora, cerrada])

  return (
    <div className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-whatsapp md:bottom-8 md:right-8">
      <AnimatePresence>
        {visible && (
          <motion.div
            key="wa"
            className="pointer-events-auto relative"
            initial={{ opacity: 0, scale: 0.5, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 24, transition: { duration: 0.3, ease: [0.5, 0, 0.75, 0] } }}
            transition={{ duration: 0.7, ease: EXPO }}
          >
            <AnimatePresence>{hora && !cerrada && <Burbuja key="burbuja" alCerrar={cerrarBurbuja} />}</AnimatePresence>

            <a
              href={enlaceWhatsApp(mensajeGeneral())}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escríbenos por WhatsApp"
              data-wa-flotante
              className="wa-boton relative grid size-14 place-items-center rounded-full bg-tinta text-papel shadow-[0_16px_34px_-12px_rgb(21_18_18/0.6)] transition-transform duration-500 ease-expo hover:scale-105 active:scale-95 md:size-16"
            >
              <span className="wa-pulso absolute inset-0 rounded-full border-2 border-camel" aria-hidden="true" />
              <span className="absolute inset-[3px] rounded-full ring-1 ring-papel/15" aria-hidden="true" />
              <IconoWhatsApp className="relative size-7 md:size-8" />
              <Mariposa grosor={1.6} className="absolute -left-1 -top-2.5 w-6 -rotate-[24deg] text-camel md:w-7" />
              <span className="wa-rotulo etiqueta pointer-events-none absolute right-full top-1/2 mr-3 whitespace-nowrap rounded-full bg-tinta px-4 py-2.5 text-papel shadow-lg">
                Escríbenos
              </span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Burbuja de asesoría: primero «escribiendo…», luego la pregunta. Tocarla abre WhatsApp. */
function Burbuja({ alCerrar }) {
  const menos = useMenosMovimiento()
  const [escribiendo, setEscribiendo] = useState(!menos)

  useEffect(() => {
    if (!escribiendo) return undefined
    const reloj = window.setTimeout(() => setEscribiendo(false), 1300)
    return () => window.clearTimeout(reloj)
  }, [escribiendo])

  return (
    <motion.div
      data-wa-burbuja
      className="absolute bottom-full right-0 mb-4 w-[min(18.75rem,calc(100vw-2rem))] origin-bottom-right md:w-[19.75rem]"
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 8, transition: { duration: 0.25 } }}
      transition={{ duration: 0.6, ease: EXPO }}
    >
      <div className="relative rounded-[22px] rounded-br-[6px] bg-papel shadow-[0_22px_48px_-20px_rgb(21_18_18/0.5)] ring-1 ring-tinta/[0.06]">
        <a
          href={enlaceWhatsApp(MENSAJE_TALLA)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={alCerrar}
          className="flex items-center gap-3 rounded-[inherit] p-3 pr-4"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-tinta text-papel" aria-hidden="true">
            <Mariposa grosor={1.7} revolotear={false} className="w-6 -rotate-12 text-camel" />
          </span>
          <span className="min-w-0">
            <span className="etiqueta block text-camel-oscuro">Asesoría personalizada</span>
            <span className="mt-1 grid">
              <span className={`col-start-1 row-start-1 text-[0.97rem] leading-snug text-tinta transition-opacity duration-300 ${escribiendo ? 'opacity-0' : 'opacity-100'}`}>
                ¿Te ayudo a encontrar tu talla?{'\u00A0'}💬
              </span>
              {escribiendo && (
                <span className="wa-puntos col-start-1 row-start-1 flex items-center gap-1 self-center" aria-hidden="true">
                  <span className="size-1.5 rounded-full bg-tinta/60" />
                  <span className="size-1.5 rounded-full bg-tinta/60" />
                  <span className="size-1.5 rounded-full bg-tinta/60" />
                </span>
              )}
            </span>
          </span>
        </a>
        <button
          type="button"
          onClick={alCerrar}
          aria-label="Cerrar el mensaje"
          className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-papel text-tinta/60 shadow-[0_6px_14px_-6px_rgb(21_18_18/0.45)] ring-1 ring-tinta/10 transition-colors before:absolute before:-inset-2.5 before:content-[''] hover:text-tinta"
        >
          <X className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  )
}
