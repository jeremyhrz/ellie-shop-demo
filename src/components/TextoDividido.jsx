import { Fragment } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { EXPO, VISTA, useMenosMovimiento } from '../lib/movimiento'
import { partirEnfasis, textoPlano } from '../lib/texto'

/**
 * Titular que entra por palabras (o letras) subiendo desde una máscara.
 *
 *   <TextoDividido como="h1" texto="Moda que resalta tu *belleza* y eleva tu *seguridad*"
 *                  className="titulo-display text-portada" />
 *   <TextoDividido texto="ellie" por="letra" alVer={false} retraso={0.4} />
 *
 * - *asteriscos* = énfasis: cursiva camel (clase `enfasis`, cámbiala con `claseEnfasis`).
 * - `alVer` (true): anima al entrar en pantalla; con false, al montar.
 * - `escalon`: segundos entre palabras/letras (por defecto 0,06 / 0,035).
 * El texto completo queda para lectores de pantalla; los trozos animados van aria-hidden.
 */
export default function TextoDividido({
  texto,
  como = 'span',
  por = 'palabra',
  retraso = 0,
  escalon,
  duracion = 0.95,
  alVer = true,
  claseEnfasis = 'enfasis',
  className,
  ...resto
}) {
  const menos = useMenosMovimiento()
  const Contenedor = motion[como]
  const pieza = menos
    ? { oculto: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }
    : { oculto: { y: '120%' }, visible: { y: '0%', transition: { duration: duracion, ease: EXPO } } }

  // Palabras con su énfasis; los espacios quedan como texto normal para que el renglón corte bien.
  const palabras = partirEnfasis(texto).flatMap(({ texto: tramo, enfasis }) =>
    tramo.split(/(\s+)/).filter(Boolean).map((p) => ({ p, enfasis })),
  )

  const disparo = alVer ? { whileInView: 'visible', viewport: VISTA } : { animate: 'visible' }

  return (
    <Contenedor
      className={className}
      initial="oculto"
      {...disparo}
      variants={{ oculto: {}, visible: { transition: { staggerChildren: escalon ?? (por === 'letra' ? 0.035 : 0.06), delayChildren: retraso } } }}
      {...resto}
    >
      <span className="sr-only">{textoPlano(texto)}</span>
      <span aria-hidden="true">
        {palabras.map(({ p, enfasis }, i) =>
          /^\s+$/.test(p) ? (
            <Fragment key={i}> </Fragment>
          ) : por === 'letra' ? (
            <span key={i} className={clsx('inline-block whitespace-nowrap', enfasis && claseEnfasis)}>
              {[...p].map((letra, j) => (
                <span key={j} className="mascara">
                  <motion.span className="inline-block" variants={pieza}>
                    {letra}
                  </motion.span>
                </span>
              ))}
            </span>
          ) : (
            <span key={i} className="mascara">
              <motion.span className={clsx('inline-block', enfasis && claseEnfasis)} variants={pieza}>
                {p}
              </motion.span>
            </span>
          ),
        )}
      </span>
    </Contenedor>
  )
}

/**
 * Párrafo con los *énfasis* de tienda.js en cursiva, sin animación.
 *   <Enfasis texto={TEXTOS.melli} className="text-lg" />
 */
export function Enfasis({ texto, como: Elemento = 'span', claseEnfasis = 'enfasis', className }) {
  return (
    <Elemento className={className}>
      {partirEnfasis(texto).map(({ texto: tramo, enfasis }, i) =>
        enfasis ? (
          <em key={i} className={claseEnfasis}>
            {tramo}
          </em>
        ) : (
          <Fragment key={i}>{tramo}</Fragment>
        ),
      )}
    </Elemento>
  )
}
