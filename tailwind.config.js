/**
 * Tailwind 3.4 compilado al construir (no el CDN), por compatibilidad con iPhones viejos.
 * Los colores viven AQUÍ; src/index.css los expone también como variables CSS (--marfil, …).
 * Las clases se leen de `content`: no armes nombres por partes (`bg-${color}`), Tailwind no los ve.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        marfil: '#F5F0E8', // fondo
        papel: '#FBF8F3',
        arena: '#E8DDCF',
        rosa: '#EFD3CF', // rubor suave
        tinta: '#151212', // texto y logo
        cafe: '#3B2A22',
        espresso: '#1A1412', // secciones oscuras
        camel: {
          DEFAULT: '#B5885A', // acento (decorativo, fondos, sobre oscuro)
          titulo: '#A67A4C', // texto grande sobre claro (contraste ≥ 3:1)
          oscuro: '#8C6440', // texto pequeño sobre claro (contraste ≥ 4,5:1)
        },
      },
      fontFamily: {
        display: ['"Bodoni Moda Variable"', '"Bodoni 72"', 'Didot', 'Georgia', 'serif'],
        sans: ['"Jost Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        portada: ['clamp(3rem, 13vw, 9.5rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        seccion: ['clamp(2.5rem, 9vw, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.015em' }],
      },
      letterSpacing: {
        etiqueta: '0.22em',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        suave: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      zIndex: {
        nav: '40',
        progreso: '41',
        whatsapp: '45',
        menu: '50',
        velo: '55',
        modal: '60',
        intro: '100',
        vuelo: '105',
        cursor: '110',
      },
      maxWidth: {
        contenedor: '1320px',
      },
    },
  },
  plugins: [],
}
