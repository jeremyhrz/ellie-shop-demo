import { createContext, useContext, useEffect, useState } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/**
 * Scroll suave con Lenis, solo con ratón o trackpad (pointer: fine) y si la visitante no pidió
 * reducir el movimiento. En el teléfono manda el scroll nativo: es el más fluido que hay.
 * Lenis mueve el scroll de verdad (window.scrollY), así que useScroll de framer-motion y
 * position: sticky funcionan igual con o sin él.
 */

const ContextoScroll = createContext(null)
let lenisActivo = null // para irA() y useBloquearScroll(), que viven fuera del árbol

const curvaExpo = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t))

export function ProveedorScroll({ children }) {
  const [lenis, setLenis] = useState(null)

  useEffect(() => {
    const fino = window.matchMedia('(pointer: fine)').matches
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fino || reducir) return undefined
    const instancia = new Lenis({ autoRaf: true, anchors: true, lerp: 0.1, stopInertiaOnNavigate: true })
    lenisActivo = instancia
    setLenis(instancia)
    return () => {
      instancia.destroy()
      lenisActivo = null
      setLenis(null)
    }
  }, [])

  return <ContextoScroll.Provider value={lenis}>{children}</ContextoScroll.Provider>
}

/** La instancia de Lenis (o null en el teléfono / con reducir movimiento). */
export function useLenis() {
  return useContext(ContextoScroll)
}

/**
 * Lleva el scroll a un ancla ('#catalogo'), a un elemento o a un número de píxeles.
 * `offset` resta (negativo) o suma píxeles al destino; `inmediato` salta sin animar.
 */
export function irA(destino, { offset = 0, inmediato = false } = {}) {
  const elemento = typeof destino === 'string' ? document.querySelector(destino) : destino
  if (elemento == null) return
  if (lenisActivo) {
    lenisActivo.scrollTo(elemento, { offset, immediate: inmediato, duration: 1.4, easing: curvaExpo })
    return
  }
  // Respeta scroll-margin-top del destino (Lenis ya lo hace solo), para no quedar bajo la barra.
  const margen = typeof elemento === 'number' ? 0 : parseFloat(getComputedStyle(elemento).scrollMarginTop) || 0
  const y = (typeof elemento === 'number' ? elemento : elemento.getBoundingClientRect().top + window.scrollY - margen) + offset
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!inmediato && !reducir) {
    window.scrollTo({ top: y, behavior: 'smooth' })
    return
  }
  // El html lleva scroll-behavior: smooth; para saltar de golpe se apaga un instante.
  const raiz = document.documentElement
  raiz.style.scrollBehavior = 'auto'
  window.scrollTo(0, y)
  raiz.style.scrollBehavior = ''
}

let bloqueos = 0

/**
 * Congela el scroll de la página mientras `activo` sea true (menú, bolsa, vista rápida).
 * Admite varios a la vez. Dentro del panel, un contenedor con scroll propio debe llevar
 * `data-lenis-prevent` para que Lenis no se coma la rueda del ratón.
 */
export function useBloquearScroll(activo) {
  useEffect(() => {
    if (!activo) return undefined
    bloqueos += 1
    if (bloqueos === 1) {
      document.documentElement.style.overflow = 'hidden'
      lenisActivo?.stop()
    }
    return () => {
      bloqueos -= 1
      if (bloqueos === 0) {
        document.documentElement.style.overflow = ''
        lenisActivo?.start()
      }
    }
  }, [activo])
}
