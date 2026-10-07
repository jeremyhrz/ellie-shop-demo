import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { buscarProducto } from '../data/tienda'

/**
 * Qué producto muestra la vista rápida. Se refleja en la URL (?p=<id>): el enlace se puede
 * compartir y, al abrir la página con ?p=, la vista rápida aparece sola. En el teléfono, el
 * botón «atrás» la cierra en vez de salir de la página.
 *
 *   const { productoId, colorInicial, abrir, cerrar } = useVistaRapida()
 *   abrir('short-melli', { color: 'Beige' })
 */

const ContextoVistaRapida = createContext(null)

function desdeLaUrl() {
  const id = new URLSearchParams(window.location.search).get('p')
  return { productoId: id && buscarProducto(id) ? id : null, colorInicial: null }
}

function urlCon(id) {
  const url = new URL(window.location.href)
  if (id) url.searchParams.set('p', id)
  else url.searchParams.delete('p')
  return url
}

/** Enlace para compartir un producto (la página con ?p=<id>). */
export function enlaceProducto(id) {
  const url = new URL(window.location.origin + window.location.pathname)
  url.searchParams.set('p', id)
  return url.toString()
}

export function ProveedorVistaRapida({ children }) {
  const [estado, setEstado] = useState(desdeLaUrl)
  const empujada = useRef(false) // true si abrir() añadió una entrada al historial

  useEffect(() => {
    const alVolver = () => {
      empujada.current = false
      setEstado(desdeLaUrl())
    }
    window.addEventListener('popstate', alVolver)
    return () => window.removeEventListener('popstate', alVolver)
  }, [])

  const abrir = useCallback((productoId, { color } = {}) => {
    if (!buscarProducto(productoId)) return
    setEstado({ productoId, colorInicial: color ?? null })
    if (empujada.current) {
      window.history.replaceState(window.history.state, '', urlCon(productoId))
    } else {
      window.history.pushState({ ellieVista: true }, '', urlCon(productoId))
      empujada.current = true
    }
  }, [])

  const cerrar = useCallback(() => {
    setEstado({ productoId: null, colorInicial: null })
    if (empujada.current) {
      empujada.current = false
      window.history.back()
    } else {
      window.history.replaceState(window.history.state, '', urlCon(null))
    }
  }, [])

  const valor = useMemo(() => ({ ...estado, abrir, cerrar }), [estado, abrir, cerrar])
  return <ContextoVistaRapida.Provider value={valor}>{children}</ContextoVistaRapida.Provider>
}

export function useVistaRapida() {
  const contexto = useContext(ContextoVistaRapida)
  if (!contexto) throw new Error('useVistaRapida() necesita estar dentro de <ProveedorVistaRapida>')
  return contexto
}
