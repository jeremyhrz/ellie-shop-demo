import Foto from '../../components/Foto'
import Mariposa from '../../components/Mariposa'
import TextoDividido from '../../components/TextoDividido'
import { TEXTOS } from '../../data/tienda'

/**
 * Acento editorial: el detalle del Short Melli café (melli-detalle) en un arco, con una insignia
 * que gira, y la frase real del carrusel: «Elegante, cómodo y con el ajuste perfecto».
 */
export default function Detalle() {
  return (
    <div className="contenedor mt-24 grid items-center gap-14 lg:mt-40 lg:grid-cols-12 lg:gap-8">
      <figure className="relative mx-auto w-[76%] max-w-[420px] lg:col-span-4 lg:col-start-2 lg:w-full">
        <div className="relative aspect-[4/5] overflow-hidden rounded-b-[28px] rounded-t-full bg-cafe">
          <Foto id="melli-detalle" rellenar revelar posicion="50% 35%" sizes="(min-width: 1024px) 420px, 76vw" />
        </div>
        <Insignia />
      </figure>

      <blockquote className="lg:col-span-6 lg:col-start-7">
        <TextoDividido
          como="p"
          texto={`«${TEXTOS.melliAjuste.replace('ajuste perfecto', '*ajuste perfecto*')}»`}
          className="font-display text-[clamp(2.6rem,10.5vw,5.5rem)] italic leading-[0.98] tracking-[-0.02em] [text-wrap:balance]"
        />
        <p className="etiqueta mt-7 flex items-center gap-3 text-camel-oscuro">
          <span aria-hidden="true" className="h-px w-8 bg-current" />
          Short Melli · el detalle
        </p>
      </blockquote>
    </div>
  )
}

/** Sello redondo con texto que gira alrededor de la mariposa del logo. */
function Insignia() {
  return (
    <div
      aria-hidden="true"
      className="absolute -bottom-7 -left-9 grid size-[7.5rem] place-items-center rounded-full bg-tinta text-papel shadow-[0_20px_40px_-18px_rgb(21_18_18/0.6)] lg:-left-16 lg:size-36"
    >
      <svg viewBox="0 0 120 120" className="melli-girar absolute inset-0 size-full">
        <defs>
          <path id="melli-aro" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1-88 0" />
        </defs>
        <text fill="currentColor" fontSize="9.4" fontWeight="500" letterSpacing="1.6">
          <textPath href="#melli-aro" textLength="274" lengthAdjust="spacing">
            SHORT MELLI ✦ TU BÁSICO FAVORITO ✦
          </textPath>
        </text>
      </svg>
      <Mariposa className="w-9 text-camel lg:w-11" revolotear={false} />
    </div>
  )
}
