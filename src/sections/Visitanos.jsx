import { useId } from 'react'
import { Clock, MapPin, Navigation } from 'lucide-react'
import Foto from '../components/Foto'
import TextoDividido from '../components/TextoDividido'
import Revelar from '../components/Revelar'
import Magnetico from '../components/Magnetico'
import Mariposa from '../components/Mariposa'
import BotonWhatsApp from '../components/BotonWhatsApp'
import { TEXTOS, TIENDA } from '../data/tienda'
import './tienda/tienda.css'

/**
 * Visítanos (#visitanos): la vitrina real con parallax, la cita de sus maniquíes (texto e),
 * dónde y cuándo (horario POR CONFIRMAR en tienda.js), «Cómo llegar» y «Escríbenos».
 */

const MENSAJE = 'Hola, Ellie 💕 Quiero visitar la tienda. ¿Me pasan la ubicación exacta?'
const [DIAS, HORAS] = TIENDA.horario.replace(/(\d) ([ap])\. m\./g, '$1\u00a0$2.\u00a0m.').split(' · ')

/** Sello circular que gira: «Te esperamos · Guacara · Carabobo» alrededor de la mariposa. */
function Sello({ className }) {
  const id = useId()
  return (
    <div className={className} aria-hidden="true">
      <div className="relative grid size-full place-items-center rounded-full bg-marfil text-tinta shadow-[0_18px_40px_-18px_rgb(26_20_18/0.45)]">
        <svg viewBox="0 0 120 120" className="tienda-giro absolute inset-0 size-full">
          <defs>
            <path id={id} d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0" />
          </defs>
          <text className="fill-current font-sans text-[9.2px] font-medium uppercase" letterSpacing="2.6">
            <textPath href={`#${id}`} textLength="281" lengthAdjust="spacing">
              Te esperamos · Guacara · Carabobo ·
            </textPath>
          </text>
        </svg>
        <Mariposa className="w-[34%] text-camel-oscuro" grosor={1.4} />
      </div>
    </div>
  )
}

export default function Visitanos() {
  return (
    <section id="visitanos" className="seccion overflow-x-clip bg-marfil" aria-labelledby="visitanos-titulo">
      <div className="contenedor grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:items-center lg:gap-x-5">
        <header className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-end">
          <p className="etiqueta mb-5 text-camel-oscuro">Visítanos</p>
          <TextoDividido como="h2" id="visitanos-titulo" texto="Ven a *conocernos*" className="titulo-display" />
        </header>

        <div className="relative -mx-[var(--margen)] lg:col-span-6 lg:row-span-2 lg:row-start-1 lg:mx-0">
          <div className="relative aspect-[4/5] lg:aspect-[5/6] lg:overflow-hidden lg:rounded-[1.75rem]">
            <Foto
              id="tienda-vitrina"
              rellenar
              revelar
              parallax={0.1}
              posicion="50% 42%"
              sizes="(min-width: 1024px) 46vw, 100vw"
            />
          </div>
          <Sello className="absolute -bottom-12 right-5 size-28 sm:size-32 lg:-right-16 lg:bottom-14 lg:size-40" />
        </div>

        <div className="mt-6 lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:mt-0 lg:self-start">
          <Revelar como="figure">
            <span aria-hidden="true" className="block h-12 font-display text-[6.5rem] leading-[0.9] text-camel lg:h-14 lg:text-[8rem]">
              “
            </span>
            <blockquote className="font-display text-[1.65rem] italic leading-[1.18] [text-wrap:pretty] lg:text-[2.1rem]">
              {TEXTOS.maniquies}
            </blockquote>
            <p className="etiqueta mt-5 text-camel-oscuro">— @{TIENDA.instagram.usuario}, en Instagram</p>
          </Revelar>

          <Revelar retraso={0.1} className="mt-10 grid gap-6 border-t border-tinta/15 pt-7 sm:grid-cols-2">
            <div className="flex gap-3.5">
              <MapPin className="mt-0.5 size-5 shrink-0 text-camel-oscuro" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="etiqueta text-tinta/60">Dónde</p>
                <p className="mt-1.5 font-medium">{TIENDA.ubicacion}</p>
              </div>
            </div>
            <div className="flex gap-3.5">
              <Clock className="mt-0.5 size-5 shrink-0 text-camel-oscuro" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="etiqueta text-tinta/60">Horario</p>
                <p className="mt-1.5 font-medium">{DIAS}</p>
                {HORAS && <p className="text-tinta/75">{HORAS}</p>}
              </div>
            </div>
          </Revelar>

          <Revelar retraso={0.2} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Magnetico className="w-full sm:w-auto">
              <a href={TIENDA.mapa} target="_blank" rel="noopener noreferrer" className="boton boton-oscuro w-full">
                <Navigation className="size-[1.1em]" strokeWidth={1.75} aria-hidden="true" />
                <span>Cómo llegar</span>
              </a>
            </Magnetico>
            <BotonWhatsApp variante="linea" mensaje={MENSAJE} className="w-full sm:w-auto">
              Escríbenos
            </BotonWhatsApp>
          </Revelar>
        </div>
      </div>
    </section>
  )
}
