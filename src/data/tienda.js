/**
 * Datos de Ellie Shop: el ÚNICO lugar con información del negocio.
 * Fuente: su Instagram @ellie_co73, al 7 de octubre de 2026. Es una demo pública: no se inventan
 * precios, reseñas ni cifras. Lo que no sabemos con certeza lleva «// POR CONFIRMAR».
 */

export const TIENDA = {
  nombre: 'Ellie Shop',
  marca: 'ellie',
  bio: 'Moda que resalta tu belleza y eleva tu seguridad',
  ubicacion: 'Guacara, Edo. Carabobo',
  envios: 'Envíos a nivel nacional',
  instagram: {
    usuario: 'ellie_co73',
    url: 'https://www.instagram.com/ellie_co73/',
    seguidores: 16195, // al 7-oct-2026
    publicaciones: 517, // al 7-oct-2026
    destacadas: ['Ubicación', 'Horario', 'Clientes', 'Métodos de pago', 'Trajes de baño'],
  },
  whatsapp: {
    numero: '584244314127', // formato wa.me: sin «+», espacios ni guiones
    visible: '+58 424-4314127',
  },
  horario: 'Lunes a sábado · 9:00 a. m. a 6:00 p. m.', // POR CONFIRMAR
  direccion: 'Guacara, Edo. Carabobo', // POR CONFIRMAR: falta la dirección exacta
  mapa: 'https://www.google.com/maps/search/?api=1&query=Ellie%20Shop%20Guacara%20Carabobo', // POR CONFIRMAR
}

/** Pagos reales: Cashea y precios en dólares a tasa BCV. Otros métodos: no los conocemos. */
export const PAGOS = {
  cashea: 'Llévatelo hoy con Cashea: pagas una parte y el resto en cuotas.',
  bcv: 'Tus prendas favoritas a tasa BCV.',
  otros: 'Pregúntanos por más métodos de pago.',
  desdeUsd: 12, // «opciones desde $12» (texto a)
}

/** Crédito discreto del pie. */
export const CREDITO = {
  texto: 'Demo de diseño · Jeremy Heras',
  whatsapp: '584127162731',
  mensaje: 'Hola Jeremy, vi la demo de Ellie Shop',
}

export const TALLAS = ['S', 'M', 'L'] // POR CONFIRMAR

/**
 * Textos reales de sus publicaciones (solo corregidas las erratas). *asteriscos* = énfasis:
 * <TextoDividido> y <Enfasis> los pintan en cursiva. sinEmojis() (src/lib/texto.js) los limpia
 * si un diseño los necesita sin emojis.
 */
export const TEXTOS = {
  // a)
  presupuesto:
    'Para ti, que te gusta lucir linda y arreglada pero buscas no gastar de más. Hemos pensado especialmente en ti y traemos estas opciones *desde $12* ✨',
  // b)
  ocasiones:
    'Aquí, en Ellie, consigues outfits espectaculares para cualquier ocasión especial ✨ Ya no tienes que ir tan lejos: tus prendas favoritas *a tasa BCV* 🖤 y *con Cashea*. ¡Te esperamos!',
  // c)
  vestidos:
    '*Versátiles, cómodos y diferentes* ✨ Son nuestros vestidos, uno para cada ocasión y con precios asequibles 🫶🏼',
  // d)
  boutique:
    '¿Ya sabes dónde conseguir *la boutique de ropa para dama más linda de Guacara*? Opciones para toda ocasión, *asesoría personalizada* y lo mejor de todo: *¡contamos con Cashea!*',
  // e)
  maniquies:
    'El efecto que causan nuestros maniquíes en todas las que vienen a visitar Ellie 😅🥰 ¿Y tú, ya nos visitaste? Te esperamos',
  // f)
  melli:
    'El *Short Melli* llegó para convertirse en *tu básico favorito* 😍 Con *talle alto* que estiliza la figura y *cinturón a juego*. Tela fresca, cómoda y de excelente calidad ✨ Disponible en *negro, café, beige y beige claro*.',
  // g) carrusel del Short Melli
  melliAjuste: 'Elegante, cómodo y con el ajuste perfecto',
  melliPregunta: '¿Cuál usarías tú?',
  melliCombina: 'Short Melli + blusa, corset o body',
}

/** Cinta de beneficios (dos marquesinas). */
export const BENEFICIOS = [
  'Envíos a todo el país',
  'Paga con Cashea',
  'Precios a tasa BCV',
  'Opciones desde $12',
  'Asesoría personalizada',
  'Guacara, Carabobo',
]

export const PRENDAS = ['Vestidos', 'Corsets', 'Bodys', 'Blazers', 'Short Melli', 'Pants', 'Suéteres', 'Carteras', 'Trajes de baño']

export const categorias = [
  { id: 'todo', nombre: 'Todo' },
  { id: 'vestidos', nombre: 'Vestidos' },
  { id: 'shorts', nombre: 'Shorts' },
  { id: 'blusas', nombre: 'Blusas' },
  { id: 'conjuntos', nombre: 'Conjuntos' },
  { id: 'accesorios', nombre: 'Accesorios' },
]

/**
 * Productos. Sin precios (regla de la demo): «Consulta disponibilidad por WhatsApp».
 * - `fotos`: ids de src/data/fotos.json; la primera es la portada y la segunda, la del hover.
 * - `colores[].foto`: la foto que se muestra al elegir ese color. `hex`: muestreado de las fotos.
 * - `articulo` y `plural`: para que el mensaje de WhatsApp diga «el Short Melli», «las Carteras».
 */
export const productos = [
  {
    id: 'short-melli',
    nombre: 'Short Melli',
    articulo: 'el',
    categoria: 'shorts',
    etiqueta: 'Tu básico favorito',
    descripcion: TEXTOS.melli,
    colores: [
      { nombre: 'Negro', hex: '#1F1E22', foto: 'melli-plano' },
      { nombre: 'Café', hex: '#5A3F33', foto: 'outfit-negro' },
      { nombre: 'Beige', hex: '#BE9F80', foto: 'outfit-azul' },
      { nombre: 'Beige claro', hex: '#D9CFC2', foto: 'outfit-rojo' },
    ],
    fotos: ['melli-plano', 'melli-detalle', 'outfit-negro', 'outfit-azul', 'outfit-rojo'],
    tallas: TALLAS,
  },
  {
    id: 'blusa-mangas-caladas',
    nombre: 'Blusa mangas caladas', // POR CONFIRMAR: nombre exacto
    articulo: 'la',
    categoria: 'blusas',
    descripcion: 'Mangas caladas que le dan el toque femenino a tu look. Combínala con tu Short Melli.',
    colores: [
      { nombre: 'Rojo', hex: '#BE2645', foto: 'outfit-rojo' },
      { nombre: 'Negro', hex: '#25262E', foto: 'outfit-negro' },
      { nombre: 'Azul', hex: '#2A4C95', foto: 'outfit-azul' },
    ],
    fotos: ['outfit-rojo', 'outfit-negro', 'outfit-azul'],
    tallas: TALLAS,
  },
  {
    id: 'vestido-azul-rey',
    nombre: 'Vestido azul rey',
    articulo: 'el',
    categoria: 'vestidos',
    descripcion: 'Vibrante, fresco, ligero',
    colores: [{ nombre: 'Azul rey', hex: '#2141A6', foto: 'vestido-azul' }],
    fotos: ['vestido-azul'],
    tallas: TALLAS,
  },
  {
    id: 'vestido-rojo',
    nombre: 'Vestido rojo',
    articulo: 'el',
    categoria: 'vestidos',
    descripcion: 'Romántico, moderno, elegante',
    colores: [{ nombre: 'Rojo', hex: '#B10C35', foto: 'vestido-rojo' }],
    fotos: ['vestido-rojo'],
    tallas: TALLAS,
  },
  {
    id: 'vestido-negro',
    nombre: 'Vestido negro',
    articulo: 'el',
    categoria: 'vestidos',
    descripcion: 'Noche, chic, poder',
    colores: [{ nombre: 'Negro', hex: '#16151A', foto: 'vestido-negro' }],
    fotos: ['vestido-negro'],
    tallas: TALLAS,
  },
  {
    id: 'vestido-fucsia',
    nombre: 'Vestido fucsia',
    articulo: 'el',
    categoria: 'vestidos',
    descripcion: 'Formal, noche, elegante',
    colores: [{ nombre: 'Fucsia', hex: '#A3124C', foto: 'vestido-fucsia' }],
    fotos: ['vestido-fucsia'],
    tallas: TALLAS,
  },
  {
    id: 'vestido-blazer-camel',
    nombre: 'Vestido blazer camel', // POR CONFIRMAR: nombre exacto
    articulo: 'el',
    categoria: 'vestidos',
    descripcion: 'Luce increíble con poco presupuesto.',
    colores: [{ nombre: 'Camel', hex: '#C68A55', foto: 'look-camel' }],
    fotos: ['look-camel', 'historia-camel'],
    tallas: TALLAS,
  },
  {
    id: 'conjunto-chaleco-marfil',
    nombre: 'Conjunto chaleco marfil', // POR CONFIRMAR: nombre exacto
    articulo: 'el',
    categoria: 'conjuntos',
    descripcion: 'Chaleco cruzado con hebilla dorada y pantalón a juego.',
    colores: [{ nombre: 'Marfil', hex: '#E9E1D3', foto: 'conjunto-marfil' }],
    fotos: ['conjunto-marfil', 'historia-marfil'],
    tallas: TALLAS,
  },
  {
    id: 'carteras',
    nombre: 'Carteras',
    articulo: 'las',
    plural: true,
    categoria: 'accesorios',
    descripcion: 'El detalle que completa tu look. ¡También con Cashea!',
    colores: [
      { nombre: 'Blanca', hex: '#EEECE7', foto: 'carteras' },
      { nombre: 'Rosa', hex: '#EBC9CF', foto: 'carteras' },
    ],
    fotos: ['carteras', 'historia-carteras'],
    tallas: [], // sin tallas
  },
]

/**
 * Los cuatro vestidos de la sección «Nuestros vestidos», con sus palabras reales (texto h).
 * `fondo`: color de la sección mientras ese vestido está en pantalla; `tinta`: texto encima.
 */
export const VESTIDOS = [
  { numero: '01', producto: 'vestido-azul-rey', nombre: 'Azul rey', palabras: 'Vibrante, fresco, ligero', foto: 'vestido-azul', fondo: '#1F3A9E', tinta: '#F5F0E8' },
  { numero: '02', producto: 'vestido-rojo', nombre: 'Rojo', palabras: 'Romántico, moderno, elegante', foto: 'vestido-rojo', fondo: '#A50F31', tinta: '#F5F0E8' },
  { numero: '03', producto: 'vestido-negro', nombre: 'Negro', palabras: 'Noche, chic, poder', foto: 'vestido-negro', fondo: '#121012', tinta: '#F5F0E8' },
  { numero: '04', producto: 'vestido-fucsia', nombre: 'Fucsia', palabras: 'Formal, noche, elegante', foto: 'vestido-fucsia', fondo: '#9E1449', tinta: '#F5F0E8' },
]

/**
 * Outfits reales del carrusel «¿Cuál usarías tú?». `nombre` es tal cual va en el mensaje de
 * WhatsApp (mensajeOutfit); `producto` + `color` sirven para agregarlos a la bolsa.
 */
export const OUTFITS = [
  {
    id: 'outfit-rojo',
    foto: 'outfit-rojo',
    blusa: { producto: 'blusa-mangas-caladas', color: 'Rojo', nombre: 'Blusa mangas caladas Roja' },
    short: { producto: 'short-melli', color: 'Beige claro', nombre: 'Short Melli Beige claro' },
  },
  {
    id: 'outfit-negro',
    foto: 'outfit-negro',
    blusa: { producto: 'blusa-mangas-caladas', color: 'Negro', nombre: 'Blusa mangas caladas Negra' },
    short: { producto: 'short-melli', color: 'Café', nombre: 'Short Melli Café' },
  },
  {
    id: 'outfit-azul',
    foto: 'outfit-azul',
    blusa: { producto: 'blusa-mangas-caladas', color: 'Azul', nombre: 'Blusa mangas caladas Azul' },
    short: { producto: 'short-melli', color: 'Beige', nombre: 'Short Melli Beige' },
  },
]

export const buscarProducto = (id) => productos.find((p) => p.id === id)

/** Foto de un producto para un color (o su portada si el color no existe). */
export function fotoDe(producto, color) {
  return producto?.colores.find((c) => c.nombre === color)?.foto ?? producto?.fotos[0]
}
