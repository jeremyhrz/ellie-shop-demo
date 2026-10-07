import { useId } from 'react'
import { motion } from 'framer-motion'
import { ALA_INFERIOR, ALA_SUPERIOR, ANTENA, BOLA, CAJAS, GROSOR, LETRAS, RIZO } from './logoTrazos'
import { EXPO, useMenosMovimiento } from '../lib/movimiento'

/**
 * Logo de Ellie: «ellie» en Bodoni con la mariposa de contorno posada sobre la primera «e».
 *
 *   <Logo className="h-9 w-auto" />          completo (mariposa + palabra); se dimensiona por la altura
 *   <Logo variante="palabra" />              solo «ellie»
 *   <Logo variante="mariposa" />             solo la mariposa
 *   <Logo animado alTerminar={…} />          la mariposa se dibuja, las letras suben una a una y el
 *                                            rizo de la «i» se traza (≈ 1,4 s desde `retraso`)
 *
 * Toma el color del texto (currentColor). `titulo` es el nombre accesible (null = decorativo).
 */
export default function Logo({ variante = 'completo', animado = false, retraso = 0, alTerminar, titulo = 'Ellie Shop', className }) {
  const menos = useMenosMovimiento()
  const idMascara = useId()
  const animar = animado && !menos
  const conMariposa = variante !== 'palabra'
  const conPalabra = variante !== 'mariposa'

  // Trazo que se dibuja solo (pathLength 0 → 1).
  const dibujar = (inicio, duracion, ultimo) =>
    animar
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { delay: retraso + inicio, duration: duracion, ease: [0.65, 0, 0.35, 1] },
            opacity: { delay: retraso + inicio, duration: 0.01 },
          },
          onAnimationComplete: ultimo ? alTerminar : undefined,
        }
      : {}

  // Letra que sube desde detrás de la línea base.
  const subir = (i) =>
    animar
      ? {
          initial: { y: 1650 },
          animate: { y: 0 },
          transition: { delay: retraso + 0.35 + i * 0.07, duration: 0.85, ease: EXPO },
        }
      : {}

  return (
    <svg
      viewBox={CAJAS[variante]}
      className={className}
      fill="currentColor"
      role={titulo ? 'img' : undefined}
      aria-label={titulo ?? undefined}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      {conPalabra && (
        <>
          <defs>
            <clipPath id={idMascara}>
              <rect x="0" y="-2400" width="3600" height="2440" />
            </clipPath>
          </defs>
          <g clipPath={animar ? `url(#${idMascara})` : undefined}>
            {LETRAS.map((d, i) => (
              <motion.path key={i} d={d} {...subir(i)} />
            ))}
          </g>
          <motion.path
            d={RIZO}
            fill="none"
            stroke="currentColor"
            strokeWidth={GROSOR.rizo}
            strokeLinecap="round"
            {...dibujar(0.85, 0.6, true)}
          />
          <motion.circle
            cx={BOLA.cx}
            cy={BOLA.cy}
            r={BOLA.r}
            {...(animar
              ? { initial: { scale: 0 }, animate: { scale: 1 }, transition: { delay: retraso + 0.8, duration: 0.5, ease: EXPO } }
              : {})}
          />
        </>
      )}
      {conMariposa && (
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d={ALA_SUPERIOR} strokeWidth={GROSOR.ala} {...dibujar(0, 0.9)} />
          <motion.path d={ALA_INFERIOR} strokeWidth={GROSOR.ala} {...dibujar(0.3, 0.6)} />
          <motion.path d={ANTENA} strokeWidth={GROSOR.antena} {...dibujar(0.65, 0.35, !conPalabra)} />
        </g>
      )}
    </svg>
  )
}
