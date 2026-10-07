import clsx from 'clsx'
import { motion } from 'framer-motion'
import Foto from '../../components/Foto'
import BotonWhatsApp from '../../components/BotonWhatsApp'
import { IconoInstagram } from '../../components/Iconos'
import Mariposa from '../../components/Mariposa'
import { TIENDA } from '../../data/tienda'
import { escalonar, transicion, useMenosMovimiento, variantes } from '../../lib/movimiento'
import { ENLACES } from './enlaces'

const CORTINA = [0.76, 0, 0.24, 1]

const miniatura = {
  oculto: { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.25 },
  visible: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, transition: transicion({ duration: 0.9 }) },
}

/**
 * Menú del teléfono a pantalla completa (fondo espresso): enlaces enormes en Bodoni que suben
 * escalonados, cada uno con su miniatura, y WhatsApp e Instagram abajo. Lo monta Navegacion
 * dentro de <AnimatePresence>; el foco, Escape y el bloqueo del scroll también los lleva ella.
 */
export default function MenuMovil({ activa, ir }) {
  const menos = useMenosMovimiento()
  const telon = menos
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 } }
    : {
        initial: { clipPath: 'inset(0% 0% 100% 0%)' },
        animate: { clipPath: 'inset(0% 0% 0% 0%)' },
        exit: { clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 0.6, ease: CORTINA } },
        transition: { duration: 0.75, ease: CORTINA },
      }

  return (
    <motion.div
      id="menu-movil"
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      className="fixed inset-0 z-menu flex flex-col bg-espresso text-marfil lg:hidden"
      {...telon}
    >
      <motion.nav
        aria-label="Secciones"
        data-lenis-prevent
        className="contenedor flex min-h-0 flex-1 flex-col overflow-y-auto pb-7 pt-[5.5rem]"
        initial="oculto"
        animate="visible"
        variants={escalonar(0.055, menos ? 0 : 0.2)}
      >
        <ul className="border-t border-marfil/10">
          {ENLACES.map((enlace, i) => {
            const actual = activa === enlace.id
            return (
              // Cada fila es UN hijo del escalonado (si no, framer cuenta sus tres piezas y los
              // botones de abajo tardarían más de un segundo en salir).
              <motion.li key={enlace.id} variants={escalonar(0.05)} className="border-b border-marfil/10">
                <a
                  href={`#${enlace.id}`}
                  onClick={ir(`#${enlace.id}`)}
                  aria-current={actual ? 'true' : undefined}
                  className="flex items-center gap-4 py-3"
                >
                  <motion.span variants={variantes.fundido} className="etiqueta w-6 shrink-0 text-camel">
                    {String(i + 1).padStart(2, '0')}
                  </motion.span>
                  <span className="mascara min-w-0 flex-1">
                    <motion.span
                      variants={variantes.mascara}
                      className={clsx(
                        'block whitespace-nowrap font-display text-[clamp(2rem,9.2vw,3.6rem)] leading-[1.05] tracking-[-0.01em]',
                        actual && 'italic text-camel',
                      )}
                    >
                      {enlace.nombre}
                    </motion.span>
                  </span>
                  <motion.span variants={miniatura} className="relative block aspect-[4/5] w-10 shrink-0 overflow-hidden rounded-[5px]">
                    <Foto id={enlace.foto} rellenar sizes="40px" alt="" />
                  </motion.span>
                </a>
              </motion.li>
            )
          })}
        </ul>

        <motion.p
          variants={variantes.aparecer}
          className="mt-auto flex items-start gap-3 pt-10 font-display text-[1.2rem] italic leading-snug text-marfil/75 [@media(max-height:780px)]:hidden"
        >
          <Mariposa className="mt-0.5 w-6 shrink-0 text-camel" grosor={1.3} />
          {TIENDA.bio}
        </motion.p>

        <motion.div variants={variantes.aparecer} className="mt-6 grid grid-cols-2 gap-3 [@media(max-height:780px)]:mt-auto [@media(max-height:780px)]:pt-8">
          <BotonWhatsApp variante="claro" className="px-3 tracking-[0.12em]">
            WhatsApp
          </BotonWhatsApp>
          <a
            href={TIENDA.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="boton boton-linea px-3 tracking-[0.12em]"
          >
            <IconoInstagram className="size-[1.2em] shrink-0" />
            <span>Instagram</span>
          </a>
        </motion.div>
        <motion.p variants={variantes.aparecer} className="etiqueta mt-5 flex flex-wrap justify-between gap-x-4 gap-y-1 text-marfil/60">
          <span>{TIENDA.ubicacion}</span>
          <span>Envíos a todo el país</span>
        </motion.p>
      </motion.nav>
    </motion.div>
  )
}
