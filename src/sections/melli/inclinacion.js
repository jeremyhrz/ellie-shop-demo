import { useEffect, useRef } from 'react'

/**
 * Inclinación 3D que sigue al cursor (ratón) o al dedo (táctil), con un brillo que la acompaña.
 *
 *   const ranura = useInclinacion(!menos)
 *   <article ref={ranura} className="melli-ranura"><div className="melli-tarjeta">…</div></article>
 *
 * La ranura NO se inclina (así mide el puntero sin que la transformación la deforme): escribe las
 * variables --rx, --ry (grados), --gx, --gy (posición del brillo) y --ga (intensidad) que usa la
 * tarjeta de dentro (melli.css). Interpola con un rAF que se duerme solo cuando llega al reposo.
 */
export function useInclinacion(activa = true, maximo = 9) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !activa) return undefined
    const s = { rx: 0, ry: 0, ga: 0, ox: 0, oy: 0, oga: 0, raf: 0 }

    const pintar = () => {
      s.rx += (s.ox - s.rx) * 0.13
      s.ry += (s.oy - s.ry) * 0.13
      s.ga += (s.oga - s.ga) * 0.13
      el.style.setProperty('--rx', `${s.rx.toFixed(2)}deg`)
      el.style.setProperty('--ry', `${s.ry.toFixed(2)}deg`)
      el.style.setProperty('--ga', s.ga.toFixed(3))
      const quieta = Math.abs(s.ox - s.rx) + Math.abs(s.oy - s.ry) < 0.02 && Math.abs(s.oga - s.ga) < 0.004
      s.raf = quieta ? 0 : requestAnimationFrame(pintar)
    }
    const despertar = () => {
      if (!s.raf) s.raf = requestAnimationFrame(pintar)
    }

    const mover = (x, y) => {
      const caja = el.getBoundingClientRect()
      const px = Math.min(1, Math.max(0, (x - caja.left) / caja.width))
      const py = Math.min(1, Math.max(0, (y - caja.top) / caja.height))
      s.ox = (0.5 - py) * maximo * 2
      s.oy = (px - 0.5) * maximo * 2
      s.oga = 1
      el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`)
      el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`)
      despertar()
    }
    const soltar = () => {
      s.ox = 0
      s.oy = 0
      s.oga = 0
      despertar()
    }

    const conRaton = (e) => e.pointerType === 'mouse' && mover(e.clientX, e.clientY)
    const conDedo = (e) => {
      const toque = e.touches[0]
      if (toque) mover(toque.clientX, toque.clientY)
    }
    const eventos = [
      ['pointermove', conRaton],
      ['pointerleave', soltar],
      ['touchstart', conDedo],
      ['touchmove', conDedo],
      ['touchend', soltar],
      ['touchcancel', soltar],
    ]
    for (const [nombre, fn] of eventos) el.addEventListener(nombre, fn, { passive: true })
    return () => {
      cancelAnimationFrame(s.raf)
      for (const [nombre, fn] of eventos) el.removeEventListener(nombre, fn)
    }
  }, [activa, maximo])

  return ref
}
