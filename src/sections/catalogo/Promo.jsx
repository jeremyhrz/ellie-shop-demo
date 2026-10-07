import Mariposa from '../../components/Mariposa'
import { IconoWhatsApp } from '../../components/Iconos'
import { PRENDAS } from '../../data/tienda'
import { enlaceWhatsApp, mensajeGeneral } from '../../lib/whatsapp'

// Lo que venden y no tiene foto en la demo (su Instagram): solo como texto, nunca inventado.
const CON_FOTO = ['Vestidos', 'Short Melli', 'Carteras']
const OTRAS = PRENDAS.filter((p) => !CON_FOTO.includes(p))
const LISTA = OTRAS.map((p, i) => (i ? p.toLowerCase() : p))
const FRASE = `${LISTA.slice(0, -1).join(', ')} y ${LISTA.at(-1)}`

/**
 * Cierra la última fila de la cuadrícula: «¿Buscas algo más?» con las otras prendas de la
 * tienda y un WhatsApp. Ocupa las celdas que sobran (clase .cat-promo, en Catalogo.jsx).
 * En escritorio, cuando es ancho, las prendas van en columna como un índice de revista.
 */
export default function Promo() {
  return (
    <div className="sobre-oscuro relative isolate flex h-full min-h-[17rem] overflow-hidden rounded-[16px] bg-espresso p-4 text-marfil sm:p-6 lg:p-10">
      <Mariposa
        revolotear={false}
        className="pointer-events-none absolute -bottom-10 -right-8 -z-10 hidden w-56 rotate-[-12deg] text-camel/10 md:block lg:w-80"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Mariposa className="w-8 text-camel lg:w-11" grosor={1.3} />
        <div className="mt-auto pt-6">
          <p className="etiqueta text-[9.5px] text-camel md:text-[11px]">En la tienda</p>
          <h3 className="mt-2 font-display text-[1.55rem] leading-[1] md:text-[2.4rem] lg:text-[3.25rem]">
            ¿Buscas algo <em className="enfasis">más</em>?
          </h3>
          <p className="mt-3 max-w-md text-[13px] leading-snug text-marfil/70 md:text-[15px] md:leading-relaxed">
            <span className="cat-promo-frase">{FRASE}. </span>
            Pregúntanos por lo que no ves aquí.
          </p>
        </div>
        <a
          href={enlaceWhatsApp(mensajeGeneral())}
          target="_blank"
          rel="noopener noreferrer"
          className="boton boton-claro mt-5 min-h-[44px] w-full gap-2 px-2 py-2 text-[10px] tracking-[0.12em] md:w-auto md:self-start md:px-7 md:text-[12px] md:tracking-[0.16em]"
        >
          <IconoWhatsApp className="size-[15px] shrink-0" />
          <span>Pregúntanos</span>
        </a>
      </div>

      {/* Índice de prendas: solo cuando el bloque es ancho (lo decide catalogo.css). */}
      <ol aria-label="Otras prendas de la tienda" className="cat-promo-indice ml-10 hidden w-[42%] shrink-0 flex-col justify-end">
        {OTRAS.map((prenda, i) => (
          <li key={prenda} className="flex items-baseline gap-4 border-b border-marfil/10 py-2.5 last:border-0">
            <span className="etiqueta w-6 text-[10px] text-camel/80">{String(i + 1).padStart(2, '0')}</span>
            <span className="font-display text-[1.7rem] italic leading-none text-marfil/90">{prenda}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
