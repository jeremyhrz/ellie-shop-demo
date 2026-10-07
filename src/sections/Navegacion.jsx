import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import Logo from '../components/Logo'
import { registrarIconoBolsa, useBolsa } from '../lib/bolsa'
import { useAtraparFoco } from '../lib/foco'
import { useIntroTerminada } from '../lib/intro'
import { EXPO } from '../lib/movimiento'
import { irA, useBloquearScroll } from '../lib/scroll'
import MenuMovil from './portada/MenuMovil'
import { ENLACES } from './portada/enlaces'
import './portada/portada.css'

const ANCLAS = ['inicio', ...ENLACES.map((e) => e.id)]

/**
 * Navegación fija: transparente sobre la portada y marfil translúcido con desenfoque al bajar.
 * Se esconde al bajar y vuelve al subir (o cuando una prenda vuela a la bolsa). Escritorio:
 * enlaces a la vista con la sección activa subrayada. Teléfono: menú a pantalla completa.
 */
export default function Navegacion() {
  const listo = useIntroTerminada()
  const { cantidad, abrir, pulso } = useBolsa()
  const [abierto, setAbierto] = useState(false)
  const [oculta, setOculta] = useState(false)
  const [solida, setSolida] = useState(false)
  const activa = useSeccionActiva()
  const capa = useRef(null)
  const pendiente = useRef(null)
  const { scrollY } = useScroll()

  useBloquearScroll(abierto)
  useAtraparFoco(capa, abierto, () => setAbierto(false))

  useMotionValueEvent(scrollY, 'change', (y) => {
    const delta = y - (scrollY.getPrevious() ?? y)
    setSolida(y > 24)
    if (y < 140) setOculta(false)
    else if (delta > 4) setOculta(true)
    else if (delta < -4) setOculta(false)
  })

  // Una prenda va camino de la bolsa: la navegación se deja ver para recibirla.
  useEffect(() => {
    if (pulso) setOculta(false)
  }, [pulso])

  // Enlace del menú: primero se cierra (y se desbloquea el scroll), luego se viaja al ancla.
  useEffect(() => {
    if (abierto || !pendiente.current) return
    const destino = pendiente.current
    pendiente.current = null
    irA(destino)
  }, [abierto])

  const ir = (destino) => (evento) => {
    evento.preventDefault()
    if (!abierto) return irA(destino)
    pendiente.current = destino
    return setAbierto(false)
  }

  const nombreBolsa = cantidad === 0 ? 'Abrir mi bolsa (vacía)' : `Abrir mi bolsa (${cantidad} ${cantidad === 1 ? 'prenda' : 'prendas'})`

  return (
    <div ref={capa}>
      <AnimatePresence>{abierto && <MenuMovil activa={activa} ir={ir} />}</AnimatePresence>

      <motion.header
        className={clsx(
          'fixed inset-x-0 top-0 transition-colors duration-500',
          abierto ? 'z-[51] text-marfil' : 'z-nav text-tinta',
        )}
        initial={false}
        animate={{ y: oculta && !abierto ? '-100%' : '0%' }}
        transition={{ duration: 0.6, ease: EXPO }}
      >
        <div
          aria-hidden="true"
          className={clsx(
            'absolute inset-0 border-b border-tinta/[0.06] bg-marfil/90 backdrop-blur-xl backdrop-saturate-150 transition-opacity duration-500',
            solida && !abierto ? 'opacity-100' : 'opacity-0',
          )}
        />
        <motion.div
          className="contenedor relative flex h-16 items-center justify-between lg:h-20"
          initial={{ opacity: 0, y: -18 }}
          animate={listo ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, ease: EXPO, delay: 0.3 }}
        >
          <a href="#inicio" onClick={ir('#inicio')} aria-label="Ellie Shop, ir al inicio" className="-ml-1 rounded-md p-1">
            <Logo className="h-[42px] w-auto lg:h-12" titulo={null} />
          </a>

          <nav aria-label="Secciones" className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <ul className="flex items-center gap-7 xl:gap-9">
              {ENLACES.map((enlace) => {
                const actual = activa === enlace.id
                return (
                  <li key={enlace.id}>
                    <a
                      href={`#${enlace.id}`}
                      onClick={ir(`#${enlace.id}`)}
                      aria-current={actual ? 'true' : undefined}
                      className={clsx(
                        'etiqueta relative block whitespace-nowrap py-2 tracking-[0.18em] transition-colors duration-300 hover:text-camel-oscuro',
                        actual && 'text-camel-oscuro',
                      )}
                    >
                      {enlace.nombre}
                      {actual && (
                        <motion.span
                          layoutId="nav-activo"
                          className="absolute inset-x-0 bottom-0 h-px bg-camel"
                          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                        />
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="-mr-2 flex items-center">
            <button
              ref={registrarIconoBolsa}
              type="button"
              onClick={() => {
                setAbierto(false) // la bolsa trae su propia trampa de foco: no pueden convivir
                abrir()
              }}
              aria-label={nombreBolsa}
              className="relative grid size-11 place-items-center rounded-full transition-colors duration-300 hover:text-camel-oscuro"
            >
              <ShoppingBag className="size-[22px]" strokeWidth={1.4} aria-hidden="true" />
              <motion.span
                data-bolsa-contador
                aria-hidden="true"
                className="absolute right-[3px] top-[5px] grid h-[18px] min-w-[18px] place-items-center rounded-full bg-camel px-1 text-[10px] font-semibold leading-none text-papel"
                initial={false}
                animate={{ scale: cantidad > 0 ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 520, damping: 22 }}
              >
                <motion.span key={cantidad} initial={{ y: 7, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35, ease: EXPO }}>
                  {cantidad > 0 ? cantidad : ''}
                </motion.span>
              </motion.span>
            </button>

            <button
              type="button"
              onClick={() => setAbierto((v) => !v)}
              aria-expanded={abierto}
              aria-controls="menu-movil"
              aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
              className="relative grid size-11 place-items-center lg:hidden"
            >
              <span
                className="absolute h-[1.5px] w-[22px] rounded-full bg-current transition-transform duration-500 ease-expo"
                style={{ transform: abierto ? 'rotate(45deg)' : 'translateY(-4px)' }}
              />
              <span
                className="absolute h-[1.5px] w-[22px] rounded-full bg-current transition-transform duration-500 ease-expo"
                style={{ transform: abierto ? 'rotate(-45deg)' : 'translateY(4px)' }}
              />
            </button>
          </div>
        </motion.div>
      </motion.header>
    </div>
  )
}

/** Id de la sección que cruza la línea del 40 % de la pantalla (o null). Funciona aunque las
 *  secciones se monten tarde (modo aislado): mide en cada scroll, una vez por cuadro. */
function useSeccionActiva() {
  const [activa, setActiva] = useState(null)
  useEffect(() => {
    let cuadro = 0
    const medir = () => {
      cuadro = 0
      const linea = window.innerHeight * 0.4
      let actual = null
      for (const id of ANCLAS) {
        const caja = document.getElementById(id)?.getBoundingClientRect()
        if (caja && caja.top <= linea && caja.bottom > linea) actual = id
      }
      setActiva(actual === 'inicio' ? null : actual)
    }
    const pedir = () => {
      if (!cuadro) cuadro = window.requestAnimationFrame(medir)
    }
    medir()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      window.cancelAnimationFrame(cuadro)
    }
  }, [])
  return activa
}
