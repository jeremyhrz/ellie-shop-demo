import { useState } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import Foto from '../../components/Foto'
import { IconoWhatsApp } from '../../components/Iconos'
import { fotoDe } from '../../data/tienda'
import { EXPO, useMenosMovimiento, usePunteroFino } from '../../lib/movimiento'
import { useVistaRapida } from '../../lib/vistaRapida'
import { enlaceWhatsApp, mensajeProducto } from '../../lib/whatsapp'
import { NOMBRE_CATEGORIA } from './medios'

const TAMANOS = '(min-width: 1024px) 24vw, (min-width: 768px) 31vw, 46vw'

// La foto se destapa de abajo arriba mientras se asienta (hereda «oculto»/«visible» del <li>).
const destape = {
  oculto: { clipPath: 'inset(100% 0% 0% 0% round 16px)' },
  visible: { clipPath: 'inset(0% 0% 0% 0% round 16px)', transition: { duration: 1.1, ease: EXPO } },
}
const asiento = {
  oculto: { scale: 1.18 },
  visible: { scale: 1, transition: { duration: 1.4, ease: EXPO } },
}

/**
 * Tarjeta del catálogo: foto 4:5 (en escritorio cambia a la segunda al pasar el cursor y los
 * puntos de color cambian la foto), categoría, nombre y «Lo quiero» (WhatsApp con esa prenda).
 * Tocar la foto o el nombre abre la vista rápida; el enlace es ?p=<id>, así que también se
 * puede abrir en otra pestaña o compartir.
 */
export default function Tarjeta({ producto }) {
  const { abrir } = useVistaRapida()
  const fino = usePunteroFino()
  const menos = useMenosMovimiento()
  const [color, setColor] = useState(producto.colores[0].nombre)
  const varios = producto.colores.length > 1
  const foto = fotoDe(producto, color)
  const segunda = producto.fotos.find((f) => f !== foto)

  const abrirVista = (evento) => {
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey || evento.button > 0) return
    evento.preventDefault()
    abrir(producto.id, varios ? { color } : undefined)
  }

  return (
    <article className="cat-tarjeta flex h-full flex-col">
      <a href={`?p=${producto.id}`} onClick={abrirVista} className="block rounded-[16px]">
        <motion.div
          variants={menos ? undefined : destape}
          className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-arena"
          data-cursor="Ver"
        >
          <motion.div variants={menos ? undefined : asiento} className="absolute inset-0">
            <AnimatePresence initial={false}>
              <motion.div
                key={foto}
                className="cat-foto-base absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <Foto id={foto} rellenar alt="" sizes={TAMANOS} />
              </motion.div>
            </AnimatePresence>
            {fino && segunda && <Foto id={segunda} rellenar alt="" sizes={TAMANOS} className="cat-foto-hover" />}
          </motion.div>

          {producto.etiqueta && (
            <span className="etiqueta absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-papel/90 px-2.5 py-1.5 text-[8.5px] tracking-[0.16em] text-tinta md:left-3 md:top-3 md:text-[10px]">
              {producto.etiqueta}
            </span>
          )}
          {fino && (
            <span className="cat-ver etiqueta absolute inset-x-3 bottom-3 flex h-11 items-center justify-center rounded-full bg-papel/90 text-[10.5px] text-tinta shadow-sm">
              Vista rápida
            </span>
          )}
        </motion.div>

        <div className="mt-3.5 px-0.5">
          <p className="etiqueta text-[9.5px] text-camel-oscuro md:text-[10.5px]">{NOMBRE_CATEGORIA[producto.categoria]}</p>
          <h3 className="mt-1.5 font-display text-[1.14rem] leading-[1.08] text-tinta md:text-[1.4rem]">{producto.nombre}</h3>
        </div>
      </a>

      <div className="mt-2.5 flex min-h-6 items-center gap-1.5 px-0.5">
        {producto.colores.map((c) =>
          fino && varios ? (
            <button
              key={c.nombre}
              type="button"
              aria-label={`Ver en ${c.nombre.toLowerCase()}`}
              aria-pressed={c.nombre === color}
              onMouseEnter={() => setColor(c.nombre)}
              onFocus={() => setColor(c.nombre)}
              onClick={() => setColor(c.nombre)}
              className="grid size-6 place-items-center rounded-full"
            >
              <Punto hex={c.hex} activo={c.nombre === color} />
            </button>
          ) : (
            <Punto key={c.nombre} hex={c.hex} activo={varios && c.nombre === color} />
          ),
        )}
        <span className="ml-1 truncate text-[12px] text-tinta/55">
          {varios ? (fino ? color : `${producto.colores.length} colores`) : producto.colores[0].nombre}
        </span>
      </div>

      <div className="mt-auto pt-3">
        <a
          href={enlaceWhatsApp(mensajeProducto({ producto, color: varios ? color : undefined }))}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Lo quiero: pedir ${producto.articulo} ${producto.nombre} por WhatsApp`}
          className="boton boton-linea min-h-[44px] w-full gap-2 px-3 py-2 text-[10.5px] tracking-[0.16em] shadow-[inset_0_0_0_1px_rgb(21_18_18/0.2)] md:text-[11.5px]"
        >
          <IconoWhatsApp className="size-[15px] shrink-0" />
          <span>Lo quiero</span>
        </a>
      </div>
    </article>
  )
}

function Punto({ hex, activo }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'block size-3 rounded-full shadow-[inset_0_0_0_1px_rgb(21_18_18/0.14)] transition-shadow duration-300',
        activo && 'ring-1 ring-tinta ring-offset-2 ring-offset-marfil',
      )}
      style={{ backgroundColor: hex }}
    />
  )
}
