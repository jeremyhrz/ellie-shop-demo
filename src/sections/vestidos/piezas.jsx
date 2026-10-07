import clsx from 'clsx'
import { AnimatePresence, motion, useTransform } from 'framer-motion'
import Foto from '../../components/Foto'
import { EXPO } from '../../lib/movimiento'

/**
 * Piezas del escenario de «Nuestros vestidos». Todas leen `t`, el avance escalonado del scroll:
 * 0 = primer vestido, 1 = segundo… con una pausa quieta sobre cada entero (ver Vestidos.jsx).
 * `entrada` (0→1) es lo que falta para que el escenario quede fijo: destapa el primer vestido.
 */

const SALIDA = [0.7, 0, 0.84, 0] // curva de salida (acelera al irse)
const TAMANOS = '(min-width: 1024px) 34vw, 72vw'

/** Avance (0→1) con que se destapa el vestido `indice`: el primero con la entrada, los demás con `t`. */
function useRevelado(indice, t, entrada) {
  return useTransform(indice === 0 ? entrada : t, indice === 0 ? [0.3, 0.92] : [indice - 1, indice], [0, 1])
}

/**
 * Una foto dentro del arco. Se destapa de abajo arriba (clip-path) atada al dedo, mientras se
 * asienta de 1,32 a 1; la de debajo sube un poco y se oscurece, como una página que se pasa.
 * Con «reducir movimiento», solo un fundido.
 */
export function CapaFoto({ vestido, indice, t, entrada, menos, visible }) {
  const revelado = useRevelado(indice, t, entrada)
  const tapado = useTransform(t, [indice, indice + 1], [0, 1])
  const clipPath = useTransform(revelado, (r) => `inset(${((1 - r) * 100).toFixed(2)}% 0% 0% 0%)`)
  const scale = useTransform(revelado, [0, 1], [1.32, 1])
  const y = useTransform(tapado, [0, 1], ['0%', '-9%'])
  const velo = useTransform(tapado, [0, 1], [0, 0.55])

  if (menos) {
    return (
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Foto id={vestido.foto} rellenar sizes={TAMANOS} />
      </motion.div>
    )
  }

  return (
    <motion.div className="absolute inset-0" style={{ clipPath }}>
      <motion.div className="absolute inset-0" style={{ scale, y }}>
        <Foto id={vestido.foto} rellenar sizes={TAMANOS} />
      </motion.div>
      <motion.div aria-hidden="true" className="absolute inset-0 bg-black" style={{ opacity: velo }} />
    </motion.div>
  )
}

/** Raya de progreso tipo historia de Instagram: se llena mientras se destapa su vestido. */
export function BarraHistoria({ indice, t, entrada, activa, etiqueta, alTocar }) {
  const scaleX = useRevelado(indice, t, entrada)
  return (
    <button
      type="button"
      onClick={alTocar}
      aria-label={etiqueta}
      aria-current={activa ? 'true' : undefined}
      className="flex h-11 flex-1 items-center"
    >
      <span className="relative block h-[2px] w-full overflow-hidden rounded-full bg-marfil/25">
        <motion.span className="absolute inset-0 origin-left rounded-full bg-marfil" style={{ scaleX }} />
      </span>
    </button>
  )
}

/** Número que rueda como un cuentakilómetros, atado al scroll (01 → 04). Quieto con «reducir movimiento». */
export function NumeroRodante({ t, numeros, activo, menos, className }) {
  const y = useTransform(t, (v) => `${(-v * 100) / numeros.length}%`)
  return (
    <span aria-hidden="true" className={clsx('block h-[1em] overflow-hidden leading-none', className)}>
      {menos ? (
        <span className="block h-[1em] leading-none">{numeros[activo]}</span>
      ) : (
        <motion.span className="block" style={{ y }}>
          {numeros.map((n) => (
            <span key={n} className="block h-[1em] leading-none">
              {n}
            </span>
          ))}
        </motion.span>
      )}
    </span>
  )
}

const PADRE = {
  entra: {},
  quieto: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
  sale: { transition: { staggerChildren: 0.025 } },
}

const LETRA = {
  entra: (dir) => ({ y: dir >= 0 ? '118%' : '-118%' }),
  quieto: { y: '0%', transition: { duration: 0.95, ease: EXPO } },
  sale: (dir) => ({ y: dir >= 0 ? '-118%' : '118%', transition: { duration: 0.5, ease: SALIDA } }),
}

const FUNDIDO = {
  entra: { opacity: 0 },
  quieto: { opacity: 1, transition: { duration: 0.4 } },
  sale: { opacity: 0, transition: { duration: 0.25 } },
}

/**
 * Nombre gigante del vestido, letra a letra desde una máscara. Va dos veces, en el mismo sitio:
 * sólido DETRÁS del arco y en contorno DELANTE. Fuera de la foto las dos copias coinciden; sobre
 * la foto solo queda el trazo. La que sale y la que entra comparten celda (sin saltos).
 */
export function NombreGigante({ vestido, dir, menos, contorno = false, className }) {
  return (
    <div aria-hidden="true" className={clsx('pointer-events-none grid select-none justify-items-center', className)}>
      <AnimatePresence custom={dir}>
        {vestido && (
          <motion.span
            key={vestido.numero}
            className={clsx('flex whitespace-nowrap [grid-area:1/1]', contorno && 'vestidos-contorno')}
            custom={dir}
            variants={menos ? FUNDIDO : PADRE}
            initial="entra"
            animate="quieto"
            exit="sale"
          >
            {[...vestido.nombre].map((letra, i) =>
              letra === ' ' ? (
                <span key={i} className="w-[0.24em] shrink-0" />
              ) : (
                <span key={i} className="mascara">
                  <motion.span className="inline-block" custom={dir} variants={menos ? undefined : LETRA}>
                    {letra}
                  </motion.span>
                </span>
              ),
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
