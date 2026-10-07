import { useEffect, useState } from 'react'
import { categorias } from '../../data/tienda'

/** true mientras la media query se cumpla (se actualiza al girar o cambiar el tamaño). */
export function useMedia(consulta) {
  const [cumple, setCumple] = useState(() => typeof window !== 'undefined' && window.matchMedia(consulta).matches)
  useEffect(() => {
    const medio = window.matchMedia(consulta)
    const cambiar = () => setCumple(medio.matches)
    cambiar()
    medio.addEventListener('change', cambiar)
    return () => medio.removeEventListener('change', cambiar)
  }, [consulta])
  return cumple
}

/** Columnas de la cuadrícula del catálogo: 2 en el teléfono, 3 en tableta, 4 en escritorio. */
export function useColumnas() {
  const tableta = useMedia('(min-width: 768px)')
  const escritorio = useMedia('(min-width: 1024px)')
  return escritorio ? 4 : tableta ? 3 : 2
}

/** «vestidos» → «Vestidos». */
export const NOMBRE_CATEGORIA = Object.fromEntries(categorias.map((c) => [c.id, c.nombre]))
