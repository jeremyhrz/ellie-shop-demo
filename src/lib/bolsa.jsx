import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { buscarProducto, fotoDe } from '../data/tienda'

/**
 * Bolsa de compras: lo que la clienta va eligiendo para pedirlo junto por WhatsApp.
 * Se guarda en localStorage (si el navegador lo permite) y se sincroniza entre pestañas.
 *
 *   const { items, agregar, quitar, vaciar, cantidad, abierta, abrir, cerrar, pulso } = useBolsa()
 *   agregar({ productoId: 'short-melli', color: 'Beige', talla: 'M' })
 */

const CLAVE = 'ellie:bolsa'
const ContextoBolsa = createContext(null)

/** Clave de una línea: misma prenda + color + talla = misma línea (suma cantidad). */
export const claveDe = ({ productoId, color, talla }) => [productoId, color ?? '', talla ?? ''].join('|')

function leer() {
  try {
    const guardado = JSON.parse(window.localStorage.getItem(CLAVE))
    return Array.isArray(guardado) ? guardado.filter((item) => item && buscarProducto(item.productoId)) : []
  } catch {
    return []
  }
}

function guardar(items) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(items))
  } catch {
    // modo privado o almacenamiento lleno: la bolsa sigue funcionando en memoria
  }
}

export function ProveedorBolsa({ children }) {
  const [items, setItems] = useState(leer)
  const [abierta, setAbierta] = useState(false)
  const [pulso, setPulso] = useState(0)

  useEffect(() => guardar(items), [items])

  useEffect(() => {
    const alCambiar = (evento) => {
      if (evento.key === CLAVE) setItems(leer())
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])

  /** Agrega una prenda: { productoId, color?, talla?, nombre?, foto? }. Nombre y foto salen del producto. */
  const agregar = useCallback((item) => {
    const producto = buscarProducto(item.productoId)
    if (!producto) return
    const nuevo = {
      productoId: producto.id,
      nombre: item.nombre ?? producto.nombre,
      color: item.color ?? null,
      talla: item.talla ?? null,
      foto: item.foto ?? fotoDe(producto, item.color),
      cantidad: 1,
    }
    nuevo.clave = claveDe(nuevo)
    setItems((previos) => {
      const existe = previos.some((x) => x.clave === nuevo.clave)
      return existe
        ? previos.map((x) => (x.clave === nuevo.clave ? { ...x, cantidad: x.cantidad + 1 } : x))
        : [...previos, nuevo]
    })
    setPulso((n) => n + 1)
  }, [])

  const quitar = useCallback((clave) => setItems((previos) => previos.filter((x) => x.clave !== clave)), [])
  const vaciar = useCallback(() => setItems([]), [])
  const abrir = useCallback(() => setAbierta(true), [])
  const cerrar = useCallback(() => setAbierta(false), [])

  const valor = useMemo(
    () => ({
      items,
      agregar,
      quitar,
      vaciar,
      cantidad: items.reduce((total, x) => total + x.cantidad, 0),
      abierta,
      abrir,
      cerrar,
      pulso, // sube en cada agregar(): útil para reaccionar (mostrar la navegación, animar algo)
    }),
    [items, agregar, quitar, vaciar, abierta, abrir, cerrar, pulso],
  )

  return <ContextoBolsa.Provider value={valor}>{children}</ContextoBolsa.Provider>
}

export function useBolsa() {
  const contexto = useContext(ContextoBolsa)
  if (!contexto) throw new Error('useBolsa() necesita estar dentro de <ProveedorBolsa>')
  return contexto
}

/* ── Vuelo a la bolsa ─────────────────────────────────────────────────────────────────── */

let iconoBolsa = null

/**
 * Registra el icono de la bolsa de la navegación (úsalo como ref: ref={registrarIconoBolsa}).
 * Si dentro hay un elemento con `data-bolsa-contador`, también rebota al llegar una prenda.
 */
export function registrarIconoBolsa(elemento) {
  iconoBolsa = elemento
}

function rebotar() {
  const blancos = [iconoBolsa, iconoBolsa?.querySelector('[data-bolsa-contador]')].filter(Boolean)
  for (const blanco of blancos) {
    blanco.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.28)' }, { transform: 'scale(1)' }], {
      duration: 480,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    })
  }
}

/**
 * Hace volar una copia de la foto (`origen`: un <img> o un elemento que contenga uno) hasta el
 * icono de la bolsa y lo hace rebotar. Devuelve una promesa que se cumple al aterrizar.
 * Llama a agregar() aparte (antes o después, como prefieras: el contador cambia al instante).
 */
export function volarABolsa(origen) {
  const imagen = origen?.tagName === 'IMG' ? origen : origen?.querySelector?.('img')
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!origen || reducir) {
    rebotar()
    return Promise.resolve()
  }

  const desde = (imagen ?? origen).getBoundingClientRect()
  const icono = iconoBolsa?.getBoundingClientRect()
  const iconoVisible = icono && icono.width > 0 && icono.bottom > 0 && icono.top < window.innerHeight
  // Si la navegación está escondida, apunta a su sitio: la esquina superior derecha.
  const hasta = iconoVisible
    ? { x: icono.left + icono.width / 2, y: icono.top + icono.height / 2 }
    : { x: window.innerWidth - 36, y: 32 }

  const clon = document.createElement(imagen ? 'img' : 'div')
  if (imagen) {
    clon.src = imagen.currentSrc || imagen.src
    clon.alt = ''
  }
  Object.assign(clon.style, {
    position: 'fixed',
    left: `${desde.left}px`,
    top: `${desde.top}px`,
    width: `${desde.width}px`,
    height: `${desde.height}px`,
    margin: '0',
    objectFit: 'cover',
    background: 'var(--arena)',
    borderRadius: '14px',
    boxShadow: '0 18px 40px -12px rgb(21 18 18 / 0.45)',
    zIndex: '105',
    pointerEvents: 'none',
    willChange: 'transform, opacity',
  })
  clon.setAttribute('aria-hidden', 'true')
  document.body.appendChild(clon)

  const dx = hasta.x - (desde.left + desde.width / 2)
  const dy = hasta.y - (desde.top + desde.height / 2)
  const final = Math.max(0.06, 30 / Math.max(desde.width, desde.height, 1))
  const vuelo = clon.animate(
    [
      { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1, borderRadius: '14px' },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.6 - 70}px) scale(${0.55 + final}) rotate(-6deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(${final}) rotate(0deg)`, opacity: 0.35, borderRadius: '50%' },
    ],
    { duration: 900, easing: 'cubic-bezier(0.55, 0, 0.1, 1)' },
  )
  return vuelo.finished
    .then(rebotar)
    .catch(() => {})
    .finally(() => clon.remove())
}
