/**
 * Utilidades para los textos de tienda.js, que marcan el énfasis con *asteriscos*.
 */

/** Separa «Moda que resalta tu *belleza*» en tramos [{ texto, enfasis }]. */
export function partirEnfasis(texto) {
  return texto
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((tramo) =>
      tramo.startsWith('*') && tramo.endsWith('*')
        ? { texto: tramo.slice(1, -1), enfasis: true }
        : { texto: tramo, enfasis: false },
    )
}

/** El texto sin los asteriscos (para aria-label, alt, mensajes…). */
export function textoPlano(texto) {
  return texto.replace(/\*/g, '')
}

/**
 * Quita emojis (y el espacio que los acompaña) para diseños que los necesitan limpios.
 * Si el emoji separaba dos frases («tu básico favorito 😍 Con talle alto»), deja un punto en su
 * lugar para que no queden pegadas: «tu básico favorito. Con talle alto».
 */
export function sinEmojis(texto) {
  return texto
    .replace(/([\p{L}\p{N}*»)])[ \t]*[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{200D}]+(?=\s+\p{Lu})/gu, '$1.')
    .replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim()
}
