import { MotionConfig } from 'framer-motion'
import { ProveedorBolsa } from './lib/bolsa'
import { ProveedorScroll } from './lib/scroll'
import { ProveedorVistaRapida } from './lib/vistaRapida'

/**
 * Todo lo que las secciones comparten. Lo usan App.jsx y el modo aislado (?solo=) de main.jsx.
 * reducedMotion="user": con «reducir movimiento», framer-motion apaga los desplazamientos.
 */
export default function Proveedores({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <ProveedorScroll>
        <ProveedorBolsa>
          <ProveedorVistaRapida>{children}</ProveedorVistaRapida>
        </ProveedorBolsa>
      </ProveedorScroll>
    </MotionConfig>
  )
}
