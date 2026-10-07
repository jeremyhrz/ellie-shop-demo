import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Logo from '../components/Logo'
import { terminarIntro } from '../lib/intro'
import { useMenosMovimiento } from '../lib/movimiento'
import { useBloquearScroll } from '../lib/scroll'

const CORTINA = [0.76, 0, 0.24, 1]

/**
 * Intro (solo la 1.ª visita de la sesión; lo decide src/lib/intro.js): sobre marfil, la mariposa
 * se dibuja, «ellie» sube letra a letra y una cortina con el borde curvo se levanta y deja ver la
 * portada, que ya estaba pintada debajo. Dura ≤ 1,8 s y se salta con un toque, la rueda o una tecla.
 * Con «reducir movimiento»: el logo quieto y un fundido corto.
 */
export default function Intro() {
  const menos = useMenosMovimiento()
  const [fase, setFase] = useState('logo') // logo → sube → fin

  useBloquearScroll(fase === 'logo')

  useEffect(() => {
    const t = window.setTimeout(() => setFase((f) => (f === 'logo' ? 'sube' : f)), menos ? 600 : 1060)
    return () => window.clearTimeout(t)
  }, [menos])

  // La portada y la navegación entran mientras la cortina sube. Si por lo que sea la animación
  // no avisa al terminar, la intro se quita igual: nunca puede quedarse tapando la página.
  useEffect(() => {
    if (fase !== 'sube') return undefined
    terminarIntro()
    const t = window.setTimeout(() => setFase('fin'), 1100)
    return () => window.clearTimeout(t)
  }, [fase])

  useEffect(() => {
    if (fase !== 'logo') return undefined
    const saltar = () => setFase('sube')
    const eventos = ['pointerdown', 'wheel', 'touchmove', 'keydown']
    eventos.forEach((e) => window.addEventListener(e, saltar, { passive: true }))
    return () => eventos.forEach((e) => window.removeEventListener(e, saltar))
  }, [fase])

  if (fase === 'fin') return null

  const sube = fase === 'sube'
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-intro bg-marfil text-tinta"
      style={{ pointerEvents: sube ? 'none' : 'auto' }}
      // Sube el alto de la pantalla más el borde curvo. Sin `initial={false}`: con `animate`
      // indefinido al montar, framer no animaría el primer cambio y la cortina no se movería.
      animate={sube ? (menos ? { opacity: 0 } : { y: -1.2 * window.innerHeight }) : undefined}
      transition={menos ? { duration: 0.35 } : { duration: 0.72, ease: CORTINA }}
      onAnimationComplete={() => sube && setFase('fin')}
    >
      <motion.div
        className="grid h-full place-items-center"
        animate={sube && !menos ? { y: -90, opacity: 0 } : undefined}
        transition={{ duration: 0.5, ease: [0.5, 0, 0.75, 0] }}
      >
        <div className="flex flex-col items-center">
          <Logo animado={!menos} retraso={0.05} titulo={null} className="h-auto w-[min(46vw,250px)]" />
          <motion.p
            className="etiqueta mt-6 text-camel-oscuro"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: menos ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            Guacara · Carabobo
          </motion.p>
        </div>
      </motion.div>

      {/* Borde curvo de la cortina: se estira mientras sube y se recoge al final. */}
      <motion.div
        className="absolute left-[-10%] top-[calc(100%-2px)] h-[18vh] w-[120%] origin-top rounded-b-[50%] bg-marfil"
        initial={{ scaleY: 0 }}
        animate={sube && !menos ? { scaleY: [0, 1, 0.35] } : undefined}
        transition={{ duration: 0.72, times: [0, 0.45, 1], ease: 'easeOut' }}
      />
    </motion.div>
  )
}
