import { motion } from 'framer-motion'
import Foto from '../components/Foto'
import TextoDividido from '../components/TextoDividido'
import Contador from '../components/Contador'
import Magnetico from '../components/Magnetico'
import { IconoInstagram } from '../components/Iconos'
import { TIENDA } from '../data/tienda'
import fotos from '../data/fotos.json'
import { VISTA, escalonar, transicion, useMenosMovimiento, variantes } from '../lib/movimiento'

/**
 * Instagram (#instagram): seguidores reales que suben hasta 16.195, 517 publicaciones y una
 * cuadrícula 3:4 con 6 fotos reales de su perfil, cada una enlazada a @ellie_co73.
 */

const FOTOS = ['look-camel', 'vestido-azul', 'carteras', 'outfit-rojo', 'conjunto-marfil', 'vestido-fucsia']

const destapar = {
  oculto: { clipPath: 'inset(100% 0% 0% 0%)' },
  visible: { clipPath: 'inset(0% 0% 0% 0%)', transition: transicion({ duration: 1.1 }) },
}

export default function Instagram() {
  const menos = useMenosMovimiento()
  const { usuario, url, seguidores, publicaciones } = TIENDA.instagram
  const enlace = { href: url, target: '_blank', rel: 'noopener noreferrer' }

  return (
    <section id="instagram" className="seccion bg-papel" aria-labelledby="instagram-titulo">
      <div className="contenedor grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-10">
        <header className="lg:col-span-5 lg:row-start-1 lg:self-end">
          <p className="etiqueta mb-5 flex items-center gap-2 text-camel-oscuro">
            <IconoInstagram className="size-4" />
            Instagram
          </p>
          <TextoDividido como="h2" id="instagram-titulo" texto="Más de 16 mil personas ya nos *siguen*" className="titulo-display lg:text-[4.75rem]" />
          <dl className="mt-10 flex flex-wrap items-end gap-x-7 gap-y-6 border-t border-tinta/15 pt-6 lg:gap-x-9">
            <div className="flex flex-col-reverse">
              <dt className="etiqueta mt-3 text-tinta/60">Seguidores</dt>
              <dd className="font-display text-[clamp(3.4rem,17vw,6.75rem)] leading-[0.85] tracking-[-0.02em]">
                <Contador valor={seguidores} duracion={2.2} />
              </dd>
            </div>
            <div className="flex flex-col-reverse pb-1">
              <dt className="etiqueta mt-3 text-tinta/60">Publicaciones</dt>
              <dd className="font-display text-[2.4rem] leading-[0.85] text-camel-titulo lg:text-5xl">
                <Contador valor={publicaciones} duracion={2.2} retraso={0.2} />
              </dd>
            </div>
          </dl>
        </header>

        <motion.ul
          className="-mx-[var(--margen)] grid grid-cols-3 gap-1 sm:mx-0 sm:gap-2 lg:col-span-7 lg:row-span-2 lg:row-start-1 lg:gap-3"
          variants={escalonar(0.09)}
          initial="oculto"
          whileInView="visible"
          viewport={VISTA}
        >
          {FOTOS.map((id) => (
            <motion.li key={id} variants={menos ? variantes.fundido : destapar}>
              <a
                {...enlace}
                aria-label={`${fotos[id].alt}. Ver en Instagram`}
                data-cursor="Ver"
                className="group relative block aspect-[3/4] overflow-hidden bg-arena sm:rounded-md lg:rounded-xl"
              >
                <Foto
                  id={id}
                  alt=""
                  rellenar
                  sizes="(min-width: 1024px) 18vw, 33vw"
                  imgClassName="transition-transform duration-700 ease-expo group-hover:scale-[1.06]"
                />
                <span className="absolute inset-0 grid place-items-center bg-tinta/35 text-papel opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <IconoInstagram className="size-7" />
                </span>
              </a>
            </motion.li>
          ))}
        </motion.ul>

        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center lg:col-span-5 lg:row-start-2 lg:flex-col lg:items-start lg:self-start">
          <Magnetico>
            <a {...enlace} className="boton boton-oscuro">
              <IconoInstagram className="size-[1.2em] shrink-0" />
              <span>Síguenos @{usuario}</span>
            </a>
          </Magnetico>
          <p className="max-w-xs text-sm text-tinta/65">Novedades, outfits y todo lo que va llegando a la tienda.</p>
        </div>
      </div>
    </section>
  )
}
