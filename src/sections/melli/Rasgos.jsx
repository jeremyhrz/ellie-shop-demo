import clsx from 'clsx'
import { motion } from 'framer-motion'
import { EXPO, VISTA, escalonar, useMenosMovimiento, variantes } from '../../lib/movimiento'

/** Los tres rasgos del texto real f): talle alto, cinturón a juego y tela fresca. */
const RASGOS = [
  { titulo: 'Talle alto', texto: 'Estiliza la figura.', Icono: IconoTalle },
  { titulo: 'Cinturón a juego', texto: 'Del mismo tono de tu short.', Icono: IconoCinturon },
  { titulo: 'Tela fresca', texto: 'Cómoda y de excelente calidad.', Icono: IconoTela },
]

/** Trazo que se dibuja (pathLength) al entrar en pantalla; con «reducir movimiento», ya dibujado. */
const trazo = (retraso = 0, duracion = 1.2) => ({
  oculto: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: duracion, ease: EXPO, delay: retraso }, opacity: { duration: 0.01, delay: retraso } },
  },
})

export default function Rasgos({ className }) {
  const menos = useMenosMovimiento()
  return (
    <motion.ul
      className={clsx('border-b border-tinta/10', className)}
      initial="oculto"
      whileInView="visible"
      viewport={VISTA}
      variants={escalonar(0.16)}
    >
      {RASGOS.map(({ titulo, texto, Icono }, i) => (
        <motion.li key={titulo} variants={menos ? variantes.fundido : variantes.aparecer} className="flex items-center gap-5 border-t border-tinta/10 py-5">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-arena/70 text-cafe">
            <Icono menos={menos} />
          </span>
          <div className="min-w-0">
            <p className="etiqueta text-camel-oscuro">0{i + 1}</p>
            <p className="mt-1 font-display text-[1.7rem] leading-[1.05]">{titulo}</p>
            <p className="mt-1 text-[15px] leading-snug text-tinta/70">{texto}</p>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  )
}

function Lienzo({ children }) {
  return (
    <svg viewBox="0 0 64 64" className="size-11 overflow-visible" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

/** Short de talle alto con una flecha que sube (y respira). */
function IconoTalle({ menos }) {
  const v = (r, d) => (menos ? undefined : trazo(r, d))
  return (
    <Lienzo>
      <motion.path variants={v(0.1)} d="M10 14H42L46 50L30 52L26 31L22 52L6 50Z" />
      <motion.path variants={v(0.5, 0.6)} d="M9.4 20H42.6" />
      <motion.path variants={v(0.6, 0.5)} d="M23 15.5h6v3.5h-6z" />
      <g className="melli-subir">
        <motion.path variants={v(0.8, 0.8)} d="M57 46V12M52.5 16.5L57 12l4.5 4.5" />
      </g>
    </Lienzo>
  )
}

/** Cinturón: la correa se dibuja y la hebilla se abrocha con un rebote. */
function IconoCinturon({ menos }) {
  const v = (r, d) => (menos ? undefined : trazo(r, d))
  return (
    <Lienzo>
      <motion.path variants={v(0.1, 1.3)} d="M3 27H54Q60 27 60 32Q60 37 54 37H3" />
      <motion.g
        variants={
          menos
            ? undefined
            : { oculto: { scale: 0.3, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 420, damping: 12, delay: 0.7 } } }
        }
      >
        <rect x="16" y="21" width="13" height="22" rx="2.5" />
        <path d="M22.5 32H34" />
      </motion.g>
      {[42, 47.5, 53].map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy="32"
          r="0.9"
          fill="currentColor"
          variants={menos ? undefined : { oculto: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 1 + i * 0.12 } } }}
        />
      ))}
    </Lienzo>
  )
}

/** Tela fresca: tres ráfagas de brisa que se dibujan y se mecen. */
function IconoTela({ menos }) {
  const v = (r, d) => (menos ? undefined : trazo(r, d))
  const brisas = ['M6 20C14 14 22 26 30 20S46 14 54 20', 'M12 32C20 26 28 38 36 32S52 26 60 32', 'M6 44C14 38 22 50 30 44S46 38 54 44']
  return (
    <Lienzo>
      {brisas.map((d, i) => (
        <g key={d} className="melli-brisa" style={{ animationDelay: `${i * -0.9}s` }}>
          <motion.path variants={v(0.1 + i * 0.22, 1.1)} d={d} />
        </g>
      ))}
    </Lienzo>
  )
}
