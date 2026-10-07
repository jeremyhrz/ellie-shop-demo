import { useEffect, useId, useMemo, useRef } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { X } from 'lucide-react'
import { useBolsa } from '../lib/bolsa'
import { useVistaRapida } from '../lib/vistaRapida'
import { enlaceWhatsApp, mensajeBolsa } from '../lib/whatsapp'
import { useAtraparFoco } from '../lib/foco'
import { irA, useBloquearScroll } from '../lib/scroll'
import { EXPO } from '../lib/movimiento'
import { BolsaVacia, BotonEnviar, FilaVaciar, Prenda, VistaMensaje, useEscritorio } from './bolsa/partes'
import './bolsa/bolsa.css'

/**
 * La bolsa: cajón a la derecha en tableta/escritorio y hoja inferior en el teléfono (se cierra
 * arrastrándola hacia abajo). Lista las prendas, deja quitarlas o vaciarlo todo, enseña cómo le
 * llega el pedido a la tienda y lo envía por WhatsApp con un toque. Esc cierra, el foco queda
 * dentro y la página no se mueve debajo.
 */
export default function Bolsa() {
  const { items, quitar, vaciar, cantidad, abierta, abrir, cerrar } = useBolsa()
  const vistaRapida = useVistaRapida()
  const escritorio = useEscritorio()
  const refPanel = useRef(null)
  const arrastre = useDragControls()
  const idTitulo = useId()

  useBloquearScroll(abierta)
  useAtraparFoco(refPanel, abierta, cerrar)

  // Solo en desarrollo: las pruebas de Playwright abren y cierran la bolsa sin depender de la navegación.
  useEffect(() => {
    if (import.meta.env.DEV) window.__ellieBolsa = { abrir, cerrar }
  }, [abrir, cerrar])

  const mensaje = useMemo(() => mensajeBolsa(items), [items])

  const explorar = () => {
    cerrar()
    if (document.querySelector('#catalogo')) window.setTimeout(() => irA('#catalogo'), 60)
  }

  const verPrenda = (item) => {
    cerrar()
    vistaRapida.abrir(item.productoId, { color: item.color ?? undefined })
  }

  const empezarArrastre = (evento) => {
    if (escritorio || evento.target.closest('button, a')) return
    arrastre.start(evento)
  }

  const fuera = escritorio ? { x: '100%' } : { y: '100%' }

  return (
    <AnimatePresence>
      {abierta && (
        <motion.div
          key="velo"
          className="fixed inset-0 right-[calc(100%-100vw)] z-velo bg-espresso/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          transition={{ duration: 0.45 }}
          onClick={cerrar}
          aria-hidden="true"
        />
      )}
      {abierta && (
        <motion.aside
          key="panel"
          ref={refPanel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={idTitulo}
          tabIndex={-1}
          className="bolsa-hoja fixed inset-x-0 bottom-0 z-modal flex flex-col overflow-hidden rounded-t-[28px] bg-marfil shadow-[0_-24px_60px_-24px_rgb(21_18_18/0.5)] outline-none md:inset-y-0 md:left-auto md:right-[calc(100%-100vw)] md:w-[29rem] md:rounded-l-[32px] md:rounded-tr-none md:shadow-[-30px_0_80px_-30px_rgb(21_18_18/0.45)]"
          initial={fuera}
          animate={{ x: 0, y: 0 }}
          exit={{ ...fuera, transition: { duration: 0.45, ease: [0.5, 0, 0.75, 0] } }}
          transition={{ duration: 0.7, ease: EXPO }}
          drag={escritorio ? false : 'y'}
          dragControls={arrastre}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.04, bottom: 0.85 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 110 || info.velocity.y > 600) cerrar()
          }}
        >
          {/* Asa + cabecera: en el teléfono, desde aquí se arrastra la hoja para cerrarla. */}
          <div className="bolsa-asa shrink-0" onPointerDown={empezarArrastre}>
            <div className="flex justify-center pt-3 md:hidden" aria-hidden="true">
              <span className="h-[5px] w-11 rounded-full bg-tinta/15" />
            </div>
            <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-3 md:px-8 md:pb-5 md:pt-9">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EXPO, delay: 0.12 }}
              >
                <p className="etiqueta text-camel-oscuro">Tu pedido por WhatsApp</p>
                <h2 id={idTitulo} className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-2 font-display text-[clamp(2.15rem,10vw,2.6rem)] leading-[0.95] md:text-[3.25rem]">
                  <span className="whitespace-nowrap">
                    Tu <em className="enfasis !text-camel-titulo">bolsa</em>
                  </span>
                  {cantidad > 0 && (
                    <motion.span
                      key={cantidad}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.45, ease: EXPO }}
                      className="etiqueta -translate-y-1.5 whitespace-nowrap rounded-full bg-arena px-2.5 py-1.5 text-tinta/75"
                    >
                      {cantidad} {cantidad === 1 ? 'prenda' : 'prendas'}
                    </motion.span>
                  )}
                </h2>
              </motion.div>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar la bolsa"
                className="-mr-1 grid size-11 shrink-0 place-items-center rounded-full border border-tinta/15 transition-colors duration-300 hover:border-tinta hover:bg-tinta hover:text-papel"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </header>
          </div>

          <motion.div layoutScroll data-lenis-prevent className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 md:px-8">
            <AnimatePresence mode="wait">
              {items.length ? (
                <motion.div key="lista" exit={{ opacity: 0, transition: { duration: 0.25 } }}>
                  <ul className="relative border-t border-tinta/10">
                    <AnimatePresence mode="popLayout">
                      {items.map((item, i) => (
                        <motion.li
                          key={item.clave}
                          layout="position"
                          initial={{ opacity: 0, y: 22 }}
                          animate={{ opacity: 1, y: 0, x: 0, transition: { duration: 0.7, ease: EXPO, delay: 0.16 + i * 0.07 } }}
                          exit={{ opacity: 0, x: 90, transition: { duration: 0.4, ease: [0.5, 0, 0.75, 0], opacity: { duration: 0.2, ease: 'linear' } } }}
                          transition={{ layout: { duration: 0.6, ease: EXPO, delay: 0.12 } }}
                        >
                          <Prenda item={item} alQuitar={() => quitar(item.clave)} alVer={() => verPrenda(item)} />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                  <motion.div layout="position" transition={{ layout: { duration: 0.6, ease: EXPO, delay: 0.12 } }}>
                    <FilaVaciar alVaciar={vaciar} />
                    <VistaMensaje texto={mensaje} />
                  </motion.div>
                </motion.div>
              ) : (
                <BolsaVacia key="vacia" alExplorar={explorar} />
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence initial={false}>
            {items.length > 0 && (
              <motion.footer
                key="pie"
                className="shrink-0 border-t border-tinta/10 bg-papel px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:px-8 md:pb-7 md:pt-5"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ duration: 0.5, ease: EXPO }}
              >
                <p className="mb-4 flex items-start gap-2.5 text-[0.9rem] leading-snug text-tinta/80">
                  <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-camel" aria-hidden="true" />
                  Te confirmamos disponibilidad y el total a tasa BCV por WhatsApp.
                </p>
                <BotonEnviar href={enlaceWhatsApp(mensaje)} />
              </motion.footer>
            )}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
