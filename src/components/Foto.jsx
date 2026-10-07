import { useCallback, useRef, useState } from 'react'
import clsx from 'clsx'
import { motion, useScroll, useTransform } from 'framer-motion'
import fotos from '../data/fotos.json'
import { VISTA, transicion, useMenosMovimiento } from '../lib/movimiento'

/**
 * Foto optimizada de src/data/fotos.json (la genera scripts/optimizar_fotos.py):
 * <picture> con AVIF + WebP, srcset por anchos, width/height reales (sin saltos de diseño) y un
 * placeholder borroso de fondo sobre el que la foto se funde al cargar.
 *
 *   <Foto id="vestido-azul" sizes="(min-width: 1024px) 33vw, 50vw" />
 *   <div className="relative aspect-[4/5]"><Foto id="melli-plano" rellenar /></div>   llena al padre
 *   <Foto id="tienda-vitrina-ancha" revelar parallax={0.12} />                          efectos
 *
 * - `sizes`: cuánto mide en pantalla; elige la variante justa (por defecto, todo el ancho).
 * - `prioridad`: para la foto principal de la portada (sin lazy, fetchpriority alta).
 * - `rellenar`: ocupa todo su padre (position absolute, inset 0) en vez de imponer su proporción;
 *   el padre necesita `relative` y su propio alto o proporción.
 * - `revelar`: al entrar en pantalla se destapa de abajo arriba (clip-path) mientras se asienta.
 * - `parallax`: fracción de desplazamiento al hacer scroll (0,08–0,2 queda elegante).
 * - `posicion`: object-position, p. ej. "50% 20%" para subir el encuadre.
 * - `alt`: por defecto, el de fotos.json. Pasa alt="" si es decorativa.
 */
export default function Foto({
  id,
  alt,
  sizes = '100vw',
  prioridad = false,
  rellenar = false,
  revelar = false,
  parallax = 0,
  posicion,
  className,
  imgClassName,
  style,
  onLoad,
  ...resto
}) {
  const datos = fotos[id]
  const menos = useMenosMovimiento()
  const [cargada, setCargada] = useState(false)

  // Si la foto ya estaba en caché, `load` puede llegar antes que React: se revisa al montar.
  const refImagen = useCallback((img) => {
    if (img?.complete && img.naturalWidth > 0) setCargada(true)
  }, [])

  if (!datos) {
    if (import.meta.env.DEV) console.warn(`<Foto>: no existe la foto «${id}» en src/data/fotos.json`)
    return null
  }

  const srcset = (formato) => datos.anchos.map((a) => `${datos.base}-${a}.${formato} ${a}w`).join(', ')
  const mediano = datos.anchos.find((a) => a >= 720) ?? datos.anchos[datos.anchos.length - 1]

  const imagen = (
    <picture>
      <source type="image/avif" srcSet={srcset('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset('webp')} sizes={sizes} />
      <img
        ref={refImagen}
        src={`${datos.base}-${mediano}.webp`}
        width={datos.ancho}
        height={datos.alto}
        alt={alt ?? datos.alt}
        loading={prioridad ? 'eager' : 'lazy'}
        fetchPriority={prioridad ? 'high' : undefined}
        decoding="async"
        draggable={false}
        className={clsx('foto__img', (cargada || prioridad) && 'is-cargada', imgClassName)}
        style={posicion ? { objectPosition: posicion } : undefined}
        onLoad={(evento) => {
          setCargada(true)
          onLoad?.(evento)
        }}
      />
    </picture>
  )

  const conRevelado = revelar && !menos
  const Envoltura = conRevelado ? motion.div : 'div'
  const propsRevelado = conRevelado
    ? {
        initial: { clipPath: 'inset(100% 0% 0% 0%)' },
        whileInView: { clipPath: 'inset(0% 0% 0% 0%)' },
        viewport: VISTA,
        transition: transicion({ duration: 1.2 }),
      }
    : {}

  return (
    <Envoltura
      className={clsx('foto', rellenar && 'foto--rellenar', className)}
      style={{
        aspectRatio: rellenar ? undefined : `${datos.ancho} / ${datos.alto}`,
        backgroundImage: `url(${datos.placeholder})`,
        backgroundColor: datos.color,
        ...style,
      }}
      {...propsRevelado}
      {...resto}
    >
      {parallax && !menos ? (
        <CapaParallax fuerza={parallax} asentar={conRevelado}>
          {imagen}
        </CapaParallax>
      ) : conRevelado ? (
        <motion.div
          className="foto__capa"
          initial={{ scale: 1.2 }}
          whileInView={{ scale: 1 }}
          viewport={VISTA}
          transition={transicion({ duration: 1.4 })}
        >
          {imagen}
        </motion.div>
      ) : (
        <div className="foto__capa">{imagen}</div>
      )}
    </Envoltura>
  )
}

/** Desplaza la foto con el scroll (agrandada lo justo para no destapar los bordes). */
function CapaParallax({ fuerza, asentar, children }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${-fuerza * 100}%`, `${fuerza * 100}%`])
  const escalaBase = 1 + fuerza * 2
  return (
    <div ref={ref} className="foto__capa">
      <motion.div
        className="foto__capa"
        style={{ y, scale: asentar ? undefined : escalaBase }}
        initial={asentar ? { scale: escalaBase * 1.15 } : false}
        whileInView={asentar ? { scale: escalaBase } : undefined}
        viewport={VISTA}
        transition={transicion({ duration: 1.4 })}
      >
        {children}
      </motion.div>
    </div>
  )
}
