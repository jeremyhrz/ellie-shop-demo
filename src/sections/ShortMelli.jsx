import './melli/melli.css'
import Revelar from '../components/Revelar'
import TextoDividido, { Enfasis } from '../components/TextoDividido'
import { TEXTOS, buscarProducto } from '../data/tienda'
import Detalle from './melli/Detalle'
import Outfits from './melli/Outfits'
import Probador from './melli/Probador'
import Rasgos from './melli/Rasgos'

/**
 * #melli — «El Short Melli» / «Tu básico favorito» (texto real f) con su probador de colores, los
 * rasgos animados y el detalle; luego «¿Cuál usarías tú?» con los 3 outfits reales.
 */
export default function ShortMelli() {
  return (
    <section id="melli" aria-labelledby="melli-titulo" className="seccion relative overflow-hidden bg-papel">
      <div className="contenedor grid gap-y-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-12">
        <header className="lg:col-span-6 lg:col-start-7 lg:self-end">
          <p className="etiqueta flex items-center gap-3 text-camel-oscuro">
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            {buscarProducto('short-melli').etiqueta}
          </p>
          <TextoDividido
            id="melli-titulo"
            como="h2"
            texto="El Short *Melli*"
            className="titulo-display mt-5 text-[clamp(3.6rem,17vw,8.5rem)]"
          />
        </header>

        <Probador className="lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center" />

        <div className="lg:col-span-5 lg:col-start-7">
          <Revelar>
            <Enfasis como="p" texto={TEXTOS.melli} className="text-[17px] leading-[1.65] text-tinta/80 lg:text-lg" />
          </Revelar>
          <Rasgos className="mt-10" />
        </div>
      </div>

      <Detalle />
      <Outfits />
    </section>
  )
}
