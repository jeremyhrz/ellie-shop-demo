import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import Revelar from '../../components/Revelar'
import TextoDividido from '../../components/TextoDividido'
import { OUTFITS, TEXTOS } from '../../data/tienda'
import { useMenosMovimiento } from '../../lib/movimiento'
import TarjetaOutfit from './TarjetaOutfit'

/**
 * «¿Cuál usarías tú?»: los 3 outfits reales. En el teléfono, carrusel con imán al centro donde
 * las tarjetas laterales se giran hacia el centro (--giro) mientras deslizas; en escritorio, tres
 * columnas. Cada tarjeta, además, se inclina con el cursor o el dedo (inclinacion.js).
 */
export default function Outfits() {
  const menos = useMenosMovimiento()
  const pista = useRef(null)
  const [actual, setActual] = useState(0)

  useEffect(() => {
    const el = pista.current
    if (!el) return undefined
    const ranuras = [...el.querySelectorAll('[data-ranura]')]
    let raf = 0
    const medir = () => {
      raf = 0
      const desliza = el.scrollWidth > el.clientWidth + 4
      const caja = el.getBoundingClientRect()
      const centro = caja.left + caja.width / 2
      let cerca = 0
      let menor = Infinity
      ranuras.forEach((r, i) => {
        const c = r.getBoundingClientRect()
        const d = desliza ? Math.max(-1, Math.min(1, (c.left + c.width / 2 - centro) / c.width)) : 0
        if (!menos) {
          r.style.setProperty('--giro', d.toFixed(3))
          r.style.setProperty('--giro-abs', Math.abs(d).toFixed(3))
        }
        if (Math.abs(d) < menor) {
          menor = Math.abs(d)
          cerca = i
        }
      })
      setActual(cerca)
    }
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(medir)
    }
    medir()
    el.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
    }
  }, [menos])

  const irA = (i) => {
    const el = pista.current
    const r = el?.querySelectorAll('[data-ranura]')[i]
    if (r) el.scrollTo({ left: r.offsetLeft - (el.clientWidth - r.offsetWidth) / 2, behavior: menos ? 'auto' : 'smooth' })
  }

  return (
    <div className="mt-24 lg:mt-40">
      <div className="contenedor flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="etiqueta flex items-center gap-3 text-camel-oscuro">
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            {TEXTOS.melliCombina}
          </p>
          <TextoDividido como="h3" texto={TEXTOS.melliPregunta.replace('tú', '*tú*')} className="titulo-display mt-5" />
        </div>
        <Revelar como="p" className="max-w-xs text-tinta/75 lg:pb-2 lg:text-right">
          Elige tu talla y llévate el look completo: la blusa y su Short Melli, cada uno en su color.
        </Revelar>
      </div>

      <div
        ref={pista}
        className="melli-pista relative mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto py-8 lg:mx-auto lg:mt-12 lg:grid lg:max-w-[calc(1320px+2*var(--margen))] lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:py-0"
      >
        {OUTFITS.map((outfit, i) => (
          <TarjetaOutfit key={outfit.id} outfit={outfit} numero={i + 1} />
        ))}
      </div>

      <div className="flex justify-center lg:hidden">
        {OUTFITS.map((outfit, i) => (
          <button
            key={outfit.id}
            type="button"
            aria-label={`Ver el look ${i + 1}`}
            aria-current={i === actual}
            onClick={() => irA(i)}
            className="grid h-11 w-9 place-items-center"
          >
            <span className={clsx('h-[3px] rounded-full transition-all duration-500 ease-expo', i === actual ? 'w-7 bg-tinta' : 'w-3 bg-tinta/25')} />
          </button>
        ))}
      </div>
    </div>
  )
}
