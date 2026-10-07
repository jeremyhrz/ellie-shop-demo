import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'
import { EXPO, useMenosMovimiento } from '../lib/movimiento'

const enteros = new Intl.NumberFormat('es-VE')

/**
 * Número que sube hasta `valor` la primera vez que entra en pantalla.
 *   <Contador valor={16195} />                                → «16.195»
 *   <Contador valor={12 * tasa} formato={formatoBs} />        → «Bs. 10.486,40»
 * Escribe directo en el DOM (sin re-render por cuadro). Lectores de pantalla: el valor final.
 */
export default function Contador({ valor, formato = (n) => enteros.format(Math.round(n)), duracion = 1.8, retraso = 0, className }) {
  const ref = useRef(null)
  const visto = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const menos = useMenosMovimiento()
  const formatoRef = useRef(formato)
  formatoRef.current = formato

  useEffect(() => {
    const nodo = ref.current
    if (!nodo) return undefined
    if (!visto || menos) {
      nodo.textContent = formatoRef.current(visto || menos ? valor : 0)
      return undefined
    }
    const control = animate(0, valor, {
      duration: duracion,
      delay: retraso,
      ease: EXPO,
      onUpdate: (n) => {
        nodo.textContent = formatoRef.current(n)
      },
    })
    return () => control.stop()
  }, [visto, menos, valor, duracion, retraso])

  return (
    <span className={className}>
      <span className="sr-only">{formato(valor)}</span>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {formato(menos ? valor : 0)}
      </span>
    </span>
  )
}
