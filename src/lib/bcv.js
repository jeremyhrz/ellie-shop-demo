import { useEffect, useState } from 'react'

/**
 * Tasa oficial del BCV en vivo (ve.dolarapi.com, CORS abierto) con caché de 30 min en
 * sessionStorage. Si algo falla, `estado` queda en 'error' y quien la use se oculta con
 * elegancia: nunca se muestra un error.
 *
 *   const { tasa, fecha, estado } = useTasaBCV()   // estado: 'cargando' | 'ok' | 'error'
 *   formatoBs(12 * tasa)  →  'Bs. 10.486,40'
 */

const URL_TASA = 'https://ve.dolarapi.com/v1/dolares/oficial'
const CLAVE = 'ellie:bcv'
const VIGENCIA = 30 * 60 * 1000
const ESPERA_MAXIMA = 8000

let peticion = null // una sola petición aunque varios componentes usen el hook a la vez

function leerCache() {
  try {
    const guardado = JSON.parse(window.sessionStorage.getItem(CLAVE))
    if (guardado?.tasa > 0 && Date.now() - guardado.guardado < VIGENCIA) return guardado
  } catch {
    // sin sessionStorage: se pide de nuevo
  }
  return null
}

async function pedirTasa() {
  const control = new AbortController()
  const reloj = setTimeout(() => control.abort(), ESPERA_MAXIMA)
  try {
    const respuesta = await fetch(URL_TASA, { signal: control.signal })
    if (!respuesta.ok) throw new Error(`Tasa BCV: HTTP ${respuesta.status}`)
    const datos = await respuesta.json()
    const tasa = Number(datos?.promedio)
    if (!(tasa > 0)) throw new Error('Tasa BCV: respuesta sin promedio')
    const valor = { tasa, fecha: datos.fechaActualizacion ?? null, guardado: Date.now() }
    try {
      window.sessionStorage.setItem(CLAVE, JSON.stringify(valor))
    } catch {
      // sin caché: no pasa nada
    }
    return valor
  } finally {
    clearTimeout(reloj)
  }
}

const aEstado = (valor) => ({
  tasa: valor.tasa,
  fecha: valor.fecha ? new Date(valor.fecha) : null,
  estado: 'ok',
})

export function useTasaBCV() {
  const [resultado, setResultado] = useState(() => {
    const cache = leerCache()
    return cache ? aEstado(cache) : { tasa: null, fecha: null, estado: 'cargando' }
  })

  useEffect(() => {
    if (resultado.estado === 'ok') return undefined
    let vigente = true
    peticion ??= pedirTasa().finally(() => {
      peticion = null
    })
    peticion.then(
      (valor) => vigente && setResultado(aEstado(valor)),
      () => vigente && setResultado({ tasa: null, fecha: null, estado: 'error' }),
    )
    return () => {
      vigente = false
    }
  }, []) // solo al montar: la caché decide si hace falta pedirla

  return resultado
}

const bolivares = new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const enteros = new Intl.NumberFormat('es-VE', { maximumFractionDigits: 0 })
const conDecimales = new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 10486.404 → 'Bs. 10.486,40' */
export const formatoBs = (monto) => `Bs. ${bolivares.format(monto)}`

/** 12 → '$12' · 12.5 → '$12,50' */
export const formatoUsd = (monto) => `$${(Number.isInteger(monto) ? enteros : conDecimales).format(monto)}`

/** Fecha de la tasa → '7 de octubre' (hora de Caracas). */
export const formatoFecha = (fecha) =>
  new Intl.DateTimeFormat('es-VE', { day: 'numeric', month: 'long', timeZone: 'America/Caracas' }).format(fecha)
