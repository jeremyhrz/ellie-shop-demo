import Proveedores from './Proveedores'
import { HAY_INTRO } from './lib/intro'
import BarraProgreso from './components/BarraProgreso'
import Cursor from './components/Cursor'
import Intro from './sections/Intro'
import Navegacion from './sections/Navegacion'
import Portada from './sections/Portada'
import CintaBeneficios from './sections/CintaBeneficios'
import Vestidos from './sections/Vestidos'
import ShortMelli from './sections/ShortMelli'
import Catalogo from './sections/Catalogo'
import Pagos from './sections/Pagos'
import Visitanos from './sections/Visitanos'
import Instagram from './sections/Instagram'
import Pie from './sections/Pie'
import WhatsAppFlotante from './sections/WhatsAppFlotante'
import Bolsa from './sections/Bolsa'
import VistaRapida from './sections/VistaRapida'

/** La página completa, en el orden del brief. Cuándo sale la intro lo decide src/lib/intro.js. */
export default function App() {
  return (
    <Proveedores>
      {HAY_INTRO && <Intro />}
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-modal focus:rounded-full focus:bg-tinta focus:px-5 focus:py-3 focus:text-papel">
        Saltar al contenido
      </a>
      <BarraProgreso />
      <Navegacion />
      <main id="contenido">
        <Portada />
        <CintaBeneficios />
        <Vestidos />
        <ShortMelli />
        <Catalogo />
        <Pagos />
        <Visitanos />
        <Instagram />
      </main>
      <Pie />
      <WhatsAppFlotante />
      <Bolsa />
      <VistaRapida />
      <Cursor />
    </Proveedores>
  )
}
