import Cinta from '../components/Cinta'
import Mariposa from '../components/Mariposa'
import { BENEFICIOS, PRENDAS } from '../data/tienda'

/**
 * Cinta de beneficios: banda espresso con dos marquesinas que corren en sentidos opuestos.
 * La de los beneficios va en Bodoni enorme, alternando redonda y cursiva (como un titular de
 * revista), entre dos filetes. La de las prendas es una cinta camel de costurera, inclinada al
 * revés: las dos se abren como unas tijeras y, en el borde izquierdo, la cinta se mete por
 * debajo de la banda (solo su margen, nunca el texto).
 * Las dos se aceleran y se sesgan con la velocidad del scroll (lo hace <Cinta>).
 */
export default function CintaBeneficios() {
  return (
    <section
      aria-label="Por qué comprar en Ellie"
      className="relative isolate overflow-hidden bg-espresso pb-16 pt-12 text-marfil md:pb-16 md:pt-16"
    >
      {/* Banda principal: beneficios, alternando redonda y cursiva */}
      <div className="relative z-10 -mx-[8%] -rotate-[2.5deg] border-y border-marfil/15 bg-espresso md:-rotate-[1.2deg]">
        <Cinta
          elementos={BENEFICIOS}
          velocidad={2.2}
          direccion={-1}
          className="py-4 font-display text-[2.35rem] leading-[1.15] tracking-[-0.01em] md:py-6 md:text-[4.75rem] [&_span:nth-child(4n+3)]:italic [&_span:nth-child(4n+3)]:text-rosa"
          claseSeparador="text-[0.42em] text-camel"
        />
      </div>

      {/* Cinta camel con las prendas: inclinada al revés y por debajo de la principal */}
      <div className="relative z-0 -mx-[8%] mt-3 rotate-[4deg] bg-camel text-espresso md:mt-7 md:rotate-[2deg]">
        <Cinta
          elementos={PRENDAS}
          velocidad={3}
          direccion={1}
          separador={<Mariposa revolotear={false} grosor={1.7} className="inline-block h-[1.45em] w-auto align-middle" />}
          className="etiqueta py-3 !text-[0.78rem] !tracking-[0.26em] md:py-4 md:!text-[0.95rem]"
          claseSeparador="!px-[1.1em] text-espresso"
        />
      </div>
    </section>
  )
}
