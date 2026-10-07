import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { animate, motion, useInView, useMotionValue } from 'framer-motion'
import Foto from '../../components/Foto'
import Mariposa from '../../components/Mariposa'
import { TIENDA } from '../../data/tienda'
import { EXPO, useMenosMovimiento, usePunteroFino } from '../../lib/movimiento'

/**
 * Pila de tres historias abiertas en abanico (portada). Cada 3,5 s la de arriba sale volando y
 * pasa al fondo; se puede arrastrar (dedo o ratón) o tocar para pasar a la siguiente. Se queda
 * quieta si la usuaria interactúa, si no está en pantalla o con «reducir movimiento».
 *
 * `children` se pinta encima, posicionado respecto a la pila (chips, mariposa…).
 */

const HISTORIAS = [
  { id: 'historia-camel' },
  { id: 'historia-marfil' },
  { id: 'vestido-rojo', posicion: '50% 30%' },
]

/** Lugar de cada carta en el abanico (0 = arriba). x e y en fracciones del ancho de la carta. */
const LUGARES = [
  { x: 0, y: 0, rotate: -3, scale: 1 },
  { x: 0.25, y: 0.035, rotate: 7, scale: 0.92 },
  { x: -0.25, y: 0.07, rotate: -10, scale: 0.85 },
]

const RESORTE = { type: 'spring', stiffness: 170, damping: 23, mass: 1 }

export default function PilaHistorias({ listo, className, children }) {
  const menos = useMenosMovimiento()
  const fino = usePunteroFino()
  const caja = useRef(null)
  const enPantalla = useInView(caja, { amount: 0.3 })
  const [ancho, setAncho] = useState(0)
  const [orden, setOrden] = useState([0, 1, 2]) // orden[0] = la carta de arriba
  const [abierta, setAbierta] = useState(false) // abanico abierto (tras la entrada)
  const [expulsion, setExpulsion] = useState(null) // { dir }: la de arriba debe salir
  const [tocando, setTocando] = useState(false)
  const [segundoPlano, setSegundoPlano] = useState(false)
  const reanudacion = useRef(0)

  useEffect(() => {
    const medir = new ResizeObserver(([entrada]) => setAncho(entrada.contentRect.width))
    medir.observe(caja.current)
    return () => medir.disconnect()
  }, [])

  // Primero aparece la pila cerrada; luego se abre en abanico.
  useEffect(() => {
    if (!listo) return undefined
    const t = window.setTimeout(() => setAbierta(true), menos ? 0 : 520)
    return () => window.clearTimeout(t)
  }, [listo, menos])

  useEffect(() => {
    const cambiar = () => setSegundoPlano(document.hidden)
    document.addEventListener('visibilitychange', cambiar)
    return () => {
      document.removeEventListener('visibilitychange', cambiar)
      window.clearTimeout(reanudacion.current)
    }
  }, [])

  const siguiente = useCallback((dir = 1) => setExpulsion((previa) => previa ?? { dir }), [])

  // La de arriba ya salió: pasa al fondo y las demás avanzan.
  const alSalir = useCallback(() => {
    setOrden(([arriba, ...resto]) => [...resto, arriba])
    setExpulsion(null)
  }, [])

  const pausar = () => {
    window.clearTimeout(reanudacion.current)
    setTocando(true)
  }
  const reanudar = (ms) => {
    window.clearTimeout(reanudacion.current)
    reanudacion.current = window.setTimeout(() => setTocando(false), ms)
  }

  const pausada = !abierta || menos || tocando || !enPantalla || segundoPlano || expulsion !== null

  return (
    <div className={clsx('relative', className)}>
      <motion.div
        ref={caja}
        className="relative aspect-[9/16] w-full"
        initial={{ opacity: 0, y: 48 }}
        animate={listo ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 1.1, ease: EXPO, delay: 0.12 }}
        onPointerEnter={(e) => e.pointerType === 'mouse' && pausar()}
        onPointerLeave={(e) => e.pointerType === 'mouse' && reanudar(500)}
        onPointerDown={pausar}
        onPointerUp={(e) => e.pointerType !== 'mouse' && reanudar(2600)}
        onPointerCancel={() => reanudar(2600)}
      >
        {HISTORIAS.map((historia, indice) => (
          <Carta
            key={historia.id}
            historia={historia}
            indice={indice}
            lugar={orden.indexOf(indice)}
            ancho={ancho}
            abierta={abierta}
            expulsion={orden[0] === indice ? expulsion : null}
            pausada={pausada}
            siguiente={siguiente}
            alSalir={alSalir}
            menos={menos}
            fino={fino}
          />
        ))}
      </motion.div>
      {children}
    </div>
  )
}

function Carta({ historia, indice, lugar, ancho, abierta, expulsion, pausada, siguiente, alSalir, menos, fino }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useMotionValue(LUGARES[0].rotate)
  const scale = useMotionValue(1)
  const saliendo = useRef(false)
  const arrastrada = useRef(false)
  const arriba = lugar === 0

  // A su lugar del abanico (cerrada: todas juntas, en el lugar de arriba).
  useEffect(() => {
    if (!ancho || saliendo.current) return undefined
    const destino = LUGARES[abierta ? lugar : 0]
    const abre = window.innerWidth >= 1024 ? 1.45 : 1 // en escritorio sobra sitio: abanico más abierto
    const t = menos ? { duration: 0 } : { ...RESORTE, delay: abierta ? lugar * 0.05 : 0 }
    const animaciones = [
      animate(x, destino.x * ancho * abre, t),
      animate(y, destino.y * ancho, t),
      animate(rotate, destino.rotate, t),
      animate(scale, destino.scale, t),
    ]
    return () => animaciones.forEach((a) => a.stop())
  }, [lugar, ancho, abierta, menos, x, y, rotate, scale])

  // Sale volando hacia un lado (fuera de la pila) y avisa para pasar al fondo.
  const salir = useCallback(
    (dir, velocidad = 0) => {
      if (saliendo.current) return
      saliendo.current = true
      const destinoX = dir * (ancho * 1.3 + 32)
      const restante = Math.abs(destinoX - x.get())
      const duracion = menos ? 0 : Math.min(0.5, Math.max(0.26, restante / Math.max(Math.abs(velocidad), 1150)))
      const t = { duration: duracion, ease: [0.22, 0.75, 0.35, 1] }
      animate(rotate, LUGARES[0].rotate + dir * 16, t)
      animate(y, y.get() - ancho * 0.07, t)
      animate(x, destinoX, t).then(() => {
        saliendo.current = false
        alSalir()
      })
    },
    [ancho, menos, x, y, rotate, alSalir],
  )

  useEffect(() => {
    if (expulsion) salir(expulsion.dir)
  }, [expulsion, salir])

  const soltar = (_, { offset, velocity }) => {
    const lejos = Math.abs(offset.x) > ancho * 0.3
    if (lejos || Math.abs(velocity.x) > 520) {
      salir(Math.sign(lejos ? offset.x : velocity.x) || 1, velocity.x)
    } else {
      animate(x, 0, { ...RESORTE, velocity: velocity.x })
      animate(y, 0, { ...RESORTE, velocity: velocity.y })
      animate(rotate, LUGARES[0].rotate, RESORTE)
    }
    window.setTimeout(() => {
      arrastrada.current = false
    }, 0)
  }

  const activa = arriba && abierta && !menos

  return (
    <motion.div
      className={clsx(
        'absolute inset-0 select-none overflow-hidden rounded-[18px] bg-arena shadow-[0_28px_60px_-24px_rgb(26_20_18/0.55)] ring-1 ring-tinta/5 will-change-transform lg:rounded-[22px]',
        arriba && 'cursor-grab active:cursor-grabbing',
      )}
      style={{ x, y, rotate, scale, zIndex: 10 - lugar }}
      drag={arriba && abierta ? (fino ? true : 'x') : false}
      dragMomentum={false}
      onDragStart={() => {
        arrastrada.current = true
        rotate.stop()
        scale.stop()
      }}
      onDrag={(_, info) => rotate.set(LUGARES[0].rotate + info.offset.x * 0.065)}
      onDragEnd={soltar}
      onClick={() => arriba && !arrastrada.current && siguiente(1)}
      onKeyDown={(e) => {
        if (arriba && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          siguiente(1)
        }
      }}
      role={arriba ? 'button' : undefined}
      tabIndex={arriba ? 0 : -1}
      aria-label={arriba ? 'Ver la siguiente foto' : undefined}
      aria-hidden={arriba ? undefined : true}
      data-cursor={arriba ? 'Arrastra' : undefined}
    >
      <Foto
        id={historia.id}
        rellenar
        prioridad={indice === 0}
        posicion={historia.posicion}
        sizes="(min-width: 1024px) 330px, 58vw"
      />

      {/* Cabecera de historia: barras de progreso y la cuenta de Instagram. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 via-black/15 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-2.5 top-2.5 flex gap-1 lg:inset-x-3 lg:top-3">
        {HISTORIAS.map((h, j) => (
          <span key={h.id} className="historia-barra">
            <i
              className={clsx((j < indice || (menos && j === indice)) && 'is-llena', j === indice && activa && 'is-activa')}
              style={{ animationPlayState: pausada ? 'paused' : 'running' }}
              onAnimationEnd={j === indice ? () => siguiente(indice % 2 ? -1 : 1) : undefined}
            />
          </span>
        ))}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute left-2.5 top-[18px] flex items-center gap-1.5 text-white lg:left-3 lg:top-5">
        <span className="grid size-6 place-items-center rounded-full bg-papel text-tinta ring-[1.5px] ring-white/80 lg:size-7">
          <Mariposa revolotear={false} grosor={1.8} className="w-3 lg:w-3.5" />
        </span>
        <span className="text-[11px] font-medium tracking-wide [text-shadow:0_1px_8px_rgb(0_0_0/0.45)] lg:text-xs">
          {TIENDA.instagram.usuario}
        </span>
      </div>
    </motion.div>
  )
}
