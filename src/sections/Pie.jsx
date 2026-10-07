import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import Logo from '../components/Logo'
import { Enfasis } from '../components/TextoDividido'
import { IconoInstagram, IconoWhatsApp } from '../components/Iconos'
import { CREDITO, TIENDA } from '../data/tienda'
import { enlaceCredito, enlaceWhatsApp, mensajeGeneral } from '../lib/whatsapp'
import { irA } from '../lib/scroll'
import './tienda/tienda.css'

/**
 * Pie: la bio, los enlaces, el wordmark «ellie» enorme (la mariposa se dibuja al entrar en
 * pantalla) y el crédito discreto de la demo.
 */

const ANCLAS = [
  ['Vestidos', '#vestidos'],
  ['Short Melli', '#melli'],
  ['Catálogo', '#catalogo'],
  ['Cómo comprar', '#comprar'],
  ['Visítanos', '#visitanos'],
  ['Instagram', '#instagram'],
]

const BIO = `${TIENDA.bio.replace('belleza', '*belleza*').replace('seguridad', '*seguridad*')} ✨`
const externo = { target: '_blank', rel: 'noopener noreferrer' }
// «9:00 a. m.» nunca se parte en dos renglones.
const [DIAS, HORAS] = TIENDA.horario.replace(/(\d) ([ap])\. m\./g, '$1\u00a0$2.\u00a0m.').split(' · ')

/** El logo completo, a todo el ancho; se monta animado la primera vez que se ve. */
function Firma() {
  const ref = useRef(null)
  const visto = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  return (
    <div ref={ref} className="aspect-[3354/2350] w-full">
      {visto && <Logo animado retraso={0.1} className="size-full" titulo="Ellie Shop" />}
    </div>
  )
}

export default function Pie() {
  return (
    <footer className="sobre-oscuro relative overflow-hidden bg-espresso text-marfil">
      <div className="contenedor grid grid-cols-1 gap-y-14 pt-24 lg:grid-cols-12 lg:gap-x-5 lg:gap-y-20 lg:pt-36">
        <div className="lg:col-span-7">
          <p className="etiqueta text-camel">{TIENDA.nombre}</p>
          <Enfasis
            como="p"
            texto={BIO}
            className="mt-5 max-w-xl font-display text-[2.15rem] leading-[1.05] tracking-[-0.01em] lg:text-[3.4rem]"
          />
          <p className="mt-6 text-marfil/65">
            {TIENDA.ubicacion} · {TIENDA.envios}
          </p>
        </div>

        <nav aria-label="Pie de página" className="grid grid-cols-2 gap-8 lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:self-end lg:pb-[4%]">
          <div>
            <p className="etiqueta text-marfil/45">Explora</p>
            <ul className="mt-4 space-y-2.5">
              {ANCLAS.map(([texto, ancla]) => (
                <li key={ancla}>
                  <a href={ancla} className="tienda-enlace pb-0.5 hover:text-camel">
                    {texto}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="etiqueta text-marfil/45">Escríbenos</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a href={enlaceWhatsApp(mensajeGeneral())} {...externo} className="tienda-enlace inline-flex items-center gap-2 pb-0.5 hover:text-camel">
                  <IconoWhatsApp className="size-4 shrink-0" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={TIENDA.instagram.url} {...externo} className="tienda-enlace inline-flex items-center gap-2 pb-0.5 hover:text-camel">
                  <IconoInstagram className="size-4 shrink-0" />@{TIENDA.instagram.usuario}
                </a>
              </li>
            </ul>
            <p className="etiqueta mt-8 text-marfil/45">Horario</p>
            <p className="mt-3 text-sm leading-relaxed text-marfil/75">
              {DIAS}
              <br />
              {HORAS}
            </p>
          </div>
        </nav>

        <div className="-mb-[2%] lg:col-span-8 lg:row-start-2">
          <Firma />
        </div>
      </div>

      <div className="contenedor">
        <div className="flex flex-col gap-4 border-t border-marfil/10 py-7 text-sm text-marfil/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {TIENDA.nombre} · Guacara, Carabobo</p>
          <a href={enlaceCredito()} {...externo} className="tienda-enlace self-start pb-0.5 text-marfil/45 hover:text-marfil sm:self-auto">
            {CREDITO.texto}
          </a>
          <button
            type="button"
            onClick={() => irA(0)}
            className="etiqueta inline-flex min-h-11 items-center gap-2 self-start text-marfil/75 transition-colors hover:text-camel sm:self-auto"
          >
            Volver arriba
            <ArrowUp className="size-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  )
}
