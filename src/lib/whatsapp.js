import { CREDITO, TIENDA, buscarProducto } from '../data/tienda'

/**
 * Mensajes de WhatsApp de la tienda. Todos se abren como https://wa.me/584244314127?text=…
 * con el texto ya escrito (encodeURIComponent), listo para que la clienta solo pulse «Enviar».
 */

const SALUDO = 'Hola, Ellie 💕'

/** Enlace wa.me con el mensaje. `numero` en formato internacional sin «+» (por defecto, la tienda). */
export function enlaceWhatsApp(texto = '', numero = TIENDA.whatsapp.numero) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}

/**
 * «Hola, Ellie 💕 Vi en su página el *Short Melli* (color: Beige, talla: M) y me encantó. ¿Está disponible?»
 * `producto`: el objeto de tienda.js o su id. `color` y `talla` son opcionales.
 */
export function mensajeProducto({ producto, color, talla }) {
  const p = typeof producto === 'string' ? buscarProducto(producto) : producto
  const detalles = [color && `color: ${color}`, talla && `talla: ${talla}`].filter(Boolean)
  const entre = detalles.length ? ` (${detalles.join(', ')})` : ''
  const verbo = p.plural ? 'me encantaron. ¿Están disponibles?' : 'me encantó. ¿Está disponible?'
  return `${SALUDO} Vi en su página ${p.articulo} *${p.nombre}*${entre} y ${verbo}`
}

/** Pedido completo de la bolsa: una línea por prenda (`items` de useBolsa()). */
export function mensajeBolsa(items) {
  const lineas = items.map((item, i) => {
    const partes = [
      `*${item.nombre}*`,
      item.color,
      item.talla && `Talla ${item.talla}`,
      item.cantidad > 1 && `${item.cantidad} unidades`,
    ].filter(Boolean)
    return `${i + 1}. ${partes.join(' · ')}`
  })
  return [
    `${SALUDO} Quiero hacer este pedido:`,
    ...lineas,
    '¿Me confirman la disponibilidad y el total a tasa BCV? ¡Gracias!',
  ].join('\n')
}

/** «Me encantó el outfit *Blusa mangas caladas Roja + Short Melli Beige claro*…». Acepta OUTFITS[i] o textos. */
export function mensajeOutfit({ blusa, short }) {
  const nombre = (pieza) => (typeof pieza === 'string' ? pieza : pieza.nombre)
  return `${SALUDO} Me encantó el outfit *${nombre(blusa)} + ${nombre(short)}*. ¿Lo tienen en mi talla?`
}

/**
 * Ayuda con la talla. Con producto: «¿Me ayudan a elegir mi talla del *Short Melli*?»;
 * sin él (botón flotante): «Vi su página web y quiero ayuda para encontrar mi talla.»
 */
export function mensajeTalla(producto) {
  const p = typeof producto === 'string' ? buscarProducto(producto) : producto
  if (!p) return `${SALUDO} Vi su página web y quiero ayuda para encontrar mi talla.`
  const de = p.articulo === 'el' ? 'del' : `de ${p.articulo}`
  return `${SALUDO} ¿Me ayudan a elegir mi talla ${de} *${p.nombre}*?`
}

export function mensajeGeneral() {
  return `${SALUDO} Vi su página web y quiero más información.`
}

/** Enlace del crédito del pie («Demo de diseño · Jeremy Heras»). */
export function enlaceCredito() {
  return enlaceWhatsApp(CREDITO.mensaje, CREDITO.whatsapp)
}
