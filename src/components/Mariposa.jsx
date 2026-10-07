import clsx from 'clsx'
import { motion } from 'framer-motion'
import { ALA_INFERIOR, ALA_SUPERIOR, ANTENA, CAJAS, GROSOR } from './logoTrazos'
import { useMenosMovimiento } from '../lib/movimiento'

/**
 * La mariposa del logo, suelta: el motivo de firma de la demo.
 *
 *   <Mariposa className="w-10 text-camel" />            revolotea: aletea, descansa y flota (CSS)
 *   <Mariposa revolotear={false} />                     quieta
 *   <Mariposa animado retraso={0.2} />                  se dibuja al montar
 *   <Mariposa grosor={1.6} />                           trazo más grueso para tamaños pequeños (< 24 px)
 *
 * Decorativa por defecto (aria-hidden); pásale `titulo` si debe leerse.
 */
export default function Mariposa({ revolotear = true, animado = false, retraso = 0, grosor = 1, titulo, className }) {
  const menos = useMenosMovimiento()
  const dibujar = (inicio, duracion) =>
    animado && !menos
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { delay: retraso + inicio, duration: duracion, ease: [0.65, 0, 0.35, 1] },
            opacity: { delay: retraso + inicio, duration: 0.01 },
          },
        }
      : {}

  return (
    <svg
      viewBox={CAJAS.mariposa}
      overflow="visible"
      className={clsx(revolotear && !menos && 'mariposa--revolotea', className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      <g className="mariposa__cuerpo">
        <motion.path className="mariposa__ala-sup" d={ALA_SUPERIOR} strokeWidth={GROSOR.ala * grosor} {...dibujar(0, 0.9)} />
        <motion.path className="mariposa__ala-inf" d={ALA_INFERIOR} strokeWidth={GROSOR.ala * grosor} {...dibujar(0.3, 0.6)} />
        <motion.path d={ANTENA} strokeWidth={GROSOR.antena * grosor} {...dibujar(0.65, 0.35)} />
      </g>
    </svg>
  )
}
