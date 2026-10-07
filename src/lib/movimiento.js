import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Lenguaje de movimiento de la demo. Todo anima transform, opacity o clip-path (GPU).
 * Con «reducir movimiento», <MotionConfig reducedMotion="user"> (Proveedores.jsx) apaga los
 * desplazamientos y quedan fundidos; lo que no sea transform (clip-path, pathLength) hay que
 * resolverlo a mano con useMenosMovimiento().
 */

export const EXPO = [0.16, 1, 0.3, 1]
export const SUAVE = [0.22, 1, 0.36, 1]

export const DURACION = {
  revelado: 1, // textos y fotos que aparecen (0,7–1,2 s)
  interaccion: 0.3, // respuesta a un toque o al cursor (0,25–0,4 s)
}

/** Opciones de `viewport` para whileInView: una sola vez, un poco antes del borde inferior. */
export const VISTA = { once: true, margin: '0px 0px -12% 0px' }

export const transicion = (extra) => ({ duration: DURACION.revelado, ease: EXPO, ...extra })

/** Variantes con estados `oculto` → `visible`. */
export const variantes = {
  // Sube y aparece.
  aparecer: {
    oculto: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: transicion() },
  },
  // Texto que sube desde una máscara (el padre lleva overflow hidden: clase .mascara).
  mascara: {
    oculto: { y: '120%' },
    visible: { y: '0%', transition: transicion() },
  },
  // Contenedor de foto que se destapa de abajo hacia arriba…
  foto: {
    oculto: { clipPath: 'inset(100% 0% 0% 0%)' },
    visible: { clipPath: 'inset(0% 0% 0% 0%)', transition: transicion({ duration: 1.2 }) },
  },
  // …mientras la foto de dentro se asienta de 1,2 a 1.
  fotoInterior: {
    oculto: { scale: 1.2 },
    visible: { scale: 1, transition: transicion({ duration: 1.4 }) },
  },
  // Solo fundido (la alternativa con «reducir movimiento»).
  fundido: {
    oculto: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  },
}

/** Padre que escalona a sus hijos: `variants={escalonar(0.06)}`. */
export const escalonar = (escalon = 0.06, retraso = 0) => ({
  oculto: {},
  visible: { transition: { staggerChildren: escalon, delayChildren: retraso } },
})

/** true si la visitante pidió reducir el movimiento. */
export function useMenosMovimiento() {
  return useReducedMotion() ?? false
}

/** true en escritorio con ratón o trackpad (puntero fino que puede hacer hover). */
export function usePunteroFino() {
  const consulta = '(pointer: fine) and (hover: hover)'
  const [fino, setFino] = useState(() => typeof window !== 'undefined' && window.matchMedia(consulta).matches)
  useEffect(() => {
    const medio = window.matchMedia(consulta)
    const cambiar = () => setFino(medio.matches)
    medio.addEventListener('change', cambiar)
    return () => medio.removeEventListener('change', cambiar)
  }, [])
  return fino
}
