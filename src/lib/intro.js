import { useSyncExternalStore } from 'react'

/**
 * ¿Hay intro en esta carga? Solo la primera visita de la sesión, nunca con ?sinintro=1 ni al
 * llegar a un producto compartido (?p=). En el modo aislado (?solo=), solo si se pidió «Intro».
 * Se decide una vez al cargar y se anota en la sesión: al recargar ya no sale.
 *
 * La Intro llama a terminarIntro() cuando su cortina empieza a subir (o si la tocan para
 * saltarla); la portada y la navegación esperan a useIntroTerminada() para hacer su entrada.
 */

const CLAVE = 'ellie:intro-vista'

function decidir() {
  const parametros = new URLSearchParams(window.location.search)
  // ?intro=1 la fuerza (para enseñarla o probarla aunque la sesión ya la haya visto).
  if (parametros.get('intro') === '1') return true
  const solo = parametros.get('solo')
  if (solo) return solo.split(',').includes('Intro')
  if (parametros.has('sinintro') || parametros.has('p')) return false
  try {
    if (window.sessionStorage.getItem(CLAVE)) return false
    window.sessionStorage.setItem(CLAVE, '1')
  } catch {
    // sin sessionStorage: la intro sale (es corta y se puede saltar)
  }
  return true
}

export const HAY_INTRO = decidir()

let terminada = !HAY_INTRO
const oyentes = new Set()

/** Avisa a quien espera la intro (portada, navegación…). Llamarla de más no hace nada. */
export function terminarIntro() {
  if (terminada) return
  terminada = true
  oyentes.forEach((avisar) => avisar())
}

// Red de seguridad: si la intro no avisa, la página no se queda esperando.
if (HAY_INTRO) window.setTimeout(terminarIntro, 2600)

const suscribir = (avisar) => {
  oyentes.add(avisar)
  return () => oyentes.delete(avisar)
}

/** true cuando la intro ya terminó (o si no hay intro). */
export function useIntroTerminada() {
  return useSyncExternalStore(suscribir, () => terminada)
}
