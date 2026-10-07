import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import Revelar from '../components/Revelar'
import TextoDividido from '../components/TextoDividido'
import { categorias, productos } from '../data/tienda'
import { useBolsa } from '../lib/bolsa'
import { EXPO } from '../lib/movimiento'
import { irA } from '../lib/scroll'
import Promo from './catalogo/Promo'
import Tarjeta from './catalogo/Tarjeta'
import { useColumnas } from './catalogo/medios'
import './catalogo/catalogo.css'

const enCategoria = (id) => (id === 'todo' ? productos : productos.filter((p) => p.categoria === id))
const CONTEO = Object.fromEntries(categorias.map((c) => [c.id, enCategoria(c.id).length]))

/** Celdas que le tocan a «¿Buscas algo más?» para cerrar la última fila (una fila entera si no sobra nada). */
const sobrantes = (n, columnas) => columnas - (n % columnas)

// Cada tarjeta sube y se funde al entrar en pantalla, en ola por columnas; al filtrar, sale encogiéndose.
const entrada = {
  oculto: { opacity: 0, y: 44 },
  visible: (retraso = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EXPO, delay: retraso, delayChildren: retraso },
  }),
}
const salida = { opacity: 0, scale: 0.9, transition: { duration: 0.22, ease: 'easeIn' } }
const VISTA_GRID = { once: true, margin: '0px 0px -8% 0px' }

/**
 * Catálogo (#catalogo): «Encuentra tu look». Filtros en píldoras con un indicador que se desliza
 * (layoutId) y una cuadrícula que se reordena con animación de layout. Cada tarjeta abre la
 * vista rápida (VistaRapida.jsx). Sin precios: se consulta por WhatsApp.
 */
export default function Catalogo() {
  const [filtro, setFiltro] = useState('todo')
  const columnas = useColumnas()
  const navVisible = useNavegacionVisible()
  const refGrid = useRef(null)
  const refBarra = useRef(null)
  const refReloj = useRef(0)
  const visibles = useMemo(() => enCategoria(filtro), [filtro])
  const n = visibles.length

  useEffect(() => () => clearTimeout(refReloj.current), [])

  const elegir = (id) => {
    if (id === filtro) return
    setFiltro(id)
    const grid = refGrid.current
    if (!grid) return
    // La cuadrícula conserva su alto mientras las tarjetas se acomodan: si la página se
    // encogiera de golpe, el scroll saltaría en plena animación.
    grid.style.minHeight = `${grid.offsetHeight}px`
    clearTimeout(refReloj.current)
    refReloj.current = setTimeout(() => {
      grid.style.minHeight = ''
    }, 900)
    // Si la cuadrícula ya quedó arriba, vuelve a su comienzo para ver el resultado del filtro
    // (al subir reaparece la navegación: se deja sitio para ella y para los filtros).
    if (grid.getBoundingClientRect().top < 0) {
      const nav = window.matchMedia('(min-width: 1024px)').matches ? 80 : 64
      irA(grid, { offset: -((refBarra.current?.offsetHeight ?? 68) + nav + 12) })
    }
  }

  return (
    <section id="catalogo" aria-labelledby="catalogo-titulo" className="seccion relative bg-marfil">
      <div className="contenedor">
        <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div>
            <Revelar como="p" y={16} className="etiqueta flex items-center gap-3 text-camel-oscuro">
              <span aria-hidden="true" className="h-px w-8 bg-current" />
              Catálogo
            </Revelar>
            <TextoDividido id="catalogo-titulo" como="h2" texto="Encuentra tu *look*" className="titulo-display mt-5" />
          </div>
          <Revelar retraso={0.15} className="max-w-[23rem] lg:pb-3">
            <p className="font-display text-[1.6rem] italic leading-tight md:text-[1.9rem]">Opciones para toda ocasión</p>
            <p className="mt-2 text-[15px] leading-relaxed text-tinta/70">
              Elige una prenda para ver sus colores y tallas, y pídela por WhatsApp.
            </p>
          </Revelar>
        </header>
      </div>

      {/* Filtros: se quedan arriba (de borde a borde) mientras se recorre la cuadrícula, justo
          debajo de la navegación cuando esta se ve. */}
      <div
        ref={refBarra}
        className={clsx('cat-filtros sticky z-30 mt-9 bg-marfil/90 backdrop-blur-md lg:mt-14', navVisible && 'cat-filtros--bajo')}
      >
        <div className="contenedor">
          <Filtros activo={filtro} alElegir={elegir} />
        </div>
      </div>

      <div className="contenedor">
        <ul
          ref={refGrid}
          className="relative mt-5 grid grid-cols-2 content-start gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 lg:mt-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-16"
        >
          <AnimatePresence mode="popLayout">
            {visibles.map((producto, i) => (
              <motion.li
                key={producto.id}
                layout
                data-producto={producto.id}
                custom={(i % columnas) * 0.08}
                variants={entrada}
                initial="oculto"
                whileInView="visible"
                viewport={VISTA_GRID}
                exit={salida}
                transition={{ layout: { duration: 0.65, ease: EXPO } }}
              >
                <Tarjeta producto={producto} />
              </motion.li>
            ))}
            <motion.li
              key="promo"
              layout="position"
              className="cat-promo"
              style={{ '--span-m': sobrantes(n, 2), '--span-t': sobrantes(n, 3), '--span-d': sobrantes(n, 4) }}
              custom={(n % columnas) * 0.08}
              variants={entrada}
              initial="oculto"
              whileInView="visible"
              viewport={VISTA_GRID}
              transition={{ layout: { duration: 0.65, ease: EXPO } }}
            >
              <Promo />
            </motion.li>
          </AnimatePresence>
        </ul>
      </div>
    </section>
  )
}

/**
 * ¿Se ve la navegación fija? Mismo criterio que Navegacion.jsx: se esconde al bajar (pasados
 * 140 px) y vuelve al subir o cuando una prenda vuela a la bolsa. Así los filtros fijos se
 * acomodan justo debajo de ella en vez de quedar tapados.
 */
function useNavegacionVisible() {
  const { scrollY } = useScroll()
  const { pulso } = useBolsa()
  const [visible, setVisible] = useState(true)
  useMotionValueEvent(scrollY, 'change', (y) => {
    const delta = y - (scrollY.getPrevious() ?? y)
    if (y < 140) setVisible(true)
    else if (delta > 4) setVisible(false)
    else if (delta < -4) setVisible(true)
  })
  useEffect(() => {
    if (pulso) setVisible(true)
  }, [pulso])
  return visible
}

/** Píldoras de categoría; la tinta de la activa se desliza de una a otra. */
function Filtros({ activo, alElegir }) {
  const refFila = useRef(null)

  const centrar = (boton) => {
    const fila = refFila.current
    if (!fila || fila.scrollWidth <= fila.clientWidth) return
    fila.scrollTo({ left: boton.offsetLeft - (fila.clientWidth - boton.offsetWidth) / 2, behavior: 'smooth' })
  }

  return (
    <motion.div
      ref={refFila}
      layoutScroll
      role="group"
      aria-label="Filtrar por categoría"
      className="cat-sin-barra -mx-[var(--margen)] flex gap-1.5 overflow-x-auto px-[var(--margen)] py-3 lg:gap-2"
    >
      {categorias.map((c) => {
        const activa = c.id === activo
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={activa}
            onClick={(evento) => {
              alElegir(c.id)
              centrar(evento.currentTarget)
            }}
            className={clsx(
              'relative h-11 shrink-0 rounded-full px-[1.15rem] text-[11.5px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 lg:px-6 lg:text-[12px]',
              activa ? 'text-papel' : 'text-tinta/70 ring-1 ring-inset ring-tinta/15 hover:text-tinta hover:ring-tinta/40',
            )}
          >
            {activa && (
              <motion.span
                layoutId="catalogo-pildora"
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-tinta"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative">
              {c.nombre}
              <sup className="ml-1 align-super text-[9px] tracking-normal opacity-60">{CONTEO[c.id]}</sup>
            </span>
          </button>
        )
      })}
    </motion.div>
  )
}
