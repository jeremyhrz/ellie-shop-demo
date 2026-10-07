import { Fragment, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, X } from 'lucide-react'
import Foto from '../../components/Foto'
import Mariposa from '../../components/Mariposa'
import { IconoWhatsApp } from '../../components/Iconos'
import { BENEFICIOS, buscarProducto, categorias } from '../../data/tienda'
import { EXPO, useMenosMovimiento } from '../../lib/movimiento'
import { partirEnfasis } from '../../lib/texto'
import { enlaceWhatsApp, mensajeGeneral } from '../../lib/whatsapp'

/** true en tableta/escritorio (≥ 768 px): la bolsa es un cajón lateral; debajo, una hoja inferior. */
export function useEscritorio() {
  const consulta = '(min-width: 768px)'
  const [si, setSi] = useState(() => window.matchMedia(consulta).matches)
  useEffect(() => {
    const medio = window.matchMedia(consulta)
    const cambiar = () => setSi(medio.matches)
    medio.addEventListener('change', cambiar)
    return () => medio.removeEventListener('change', cambiar)
  }, [])
  return si
}

/** Una prenda de la bolsa: miniatura, categoría, nombre, color (con su muestra) y talla. */
export function Prenda({ item, alQuitar, alVer }) {
  const producto = buscarProducto(item.productoId)
  const hex = producto?.colores.find((c) => c.nombre === item.color)?.hex
  const categoria = categorias.find((c) => c.id === producto?.categoria)?.nombre
  return (
    <div className="grid grid-cols-[5.25rem_1fr_auto] items-center gap-4 border-b border-tinta/10 py-4 md:grid-cols-[6rem_1fr_auto]">
      <button
        type="button"
        onClick={alVer}
        aria-label={`Ver ${item.nombre}`}
        data-cursor="Ver"
        className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-arena shadow-[0_10px_24px_-14px_rgb(21_18_18/0.5)]"
      >
        <Foto id={item.foto} rellenar alt="" sizes="96px" imgClassName="transition-transform duration-700 ease-expo hover:scale-105" />
        {item.cantidad > 1 && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-tinta/85 px-2 py-0.5 text-[0.7rem] font-medium tabular-nums text-papel">
            ×{item.cantidad}
          </span>
        )}
      </button>

      <div className="min-w-0">
        {categoria && <p className="etiqueta text-camel-oscuro">{categoria}</p>}
        <h3 className="mt-1 font-display text-[1.3rem] leading-[1.1] md:text-[1.45rem]">{item.nombre}</h3>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.9rem] leading-none text-tinta/70">
          {item.color && (
            <span className="inline-flex items-center gap-1.5">
              {hex && <span className="size-3 rounded-full ring-1 ring-tinta/20" style={{ backgroundColor: hex }} />}
              {item.color}
            </span>
          )}
          {item.color && item.talla && <span aria-hidden="true">·</span>}
          {item.talla && <span>Talla {item.talla}</span>}
          {item.cantidad > 1 && <span className="sr-only">, {item.cantidad} unidades</span>}
        </p>
      </div>

      <button
        type="button"
        onClick={alQuitar}
        aria-label={`Quitar ${item.nombre} de tu bolsa`}
        className="-mr-2 grid size-11 place-items-center self-start rounded-full text-tinta/55 transition-colors duration-300 hover:bg-tinta/[0.06] hover:text-tinta"
      >
        <X className="size-[1.1rem]" strokeWidth={1.5} />
      </button>
    </div>
  )
}

/** «Vaciar bolsa» pide confirmación en el sitio: vaciar por error duele. */
export function FilaVaciar({ alVaciar }) {
  const [confirmar, setConfirmar] = useState(false)
  const enlace = 'min-h-11 px-1 underline decoration-tinta/25 underline-offset-4 transition-colors hover:decoration-current'
  return (
    <div className="flex min-h-14 items-center justify-end gap-3 text-[0.9rem]">
      <AnimatePresence mode="wait" initial={false}>
        {confirmar ? (
          <motion.div key="si" className="flex items-center gap-3" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <span className="text-tinta/70">¿Vaciar tu bolsa?</span>
            <button type="button" onClick={alVaciar} className={`${enlace} font-medium text-[#9A1B2E]`}>
              Sí, vaciar
            </button>
            <button type="button" onClick={() => setConfirmar(false)} className={`${enlace} text-tinta/70`}>
              No
            </button>
          </motion.div>
        ) : (
          <motion.button key="vaciar" type="button" onClick={() => setConfirmar(true)} className={`${enlace} text-tinta/70`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Vaciar bolsa
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Vista previa del mensaje tal cual llega al WhatsApp de la tienda: sin sorpresas al enviar. */
export function VistaMensaje({ texto }) {
  return (
    <figure className="mb-6 mt-1 rounded-[22px] bg-arena/70 p-4 md:p-5">
      <figcaption className="etiqueta flex items-center gap-2 text-tinta/60">
        <IconoWhatsApp className="size-3.5" />
        Así le llega tu pedido a Ellie
      </figcaption>
      <div className="relative ml-auto mt-3 w-fit max-w-[95%] rounded-[18px] rounded-tr-[5px] bg-papel px-4 py-3 text-[0.875rem] leading-relaxed text-tinta/85 shadow-[0_6px_18px_-12px_rgb(21_18_18/0.35)]">
        {texto.split('\n').map((linea, i) => (
          <p key={i} className={i === 0 ? 'mb-1' : undefined}>
            {partirEnfasis(linea).map(({ texto: tramo, enfasis }, j) =>
              enfasis ? (
                <strong key={j} className="font-semibold text-tinta">
                  {tramo}
                </strong>
              ) : (
                <Fragment key={j}>{tramo}</Fragment>
              ),
            )}
          </p>
        ))}
      </div>
    </figure>
  )
}

const TRANQUILIDAD = [BENEFICIOS.find((b) => /cashea/i.test(b)), BENEFICIOS.find((b) => /env/i.test(b))].filter(Boolean).join(' · ')

/**
 * El cierre de la venta: botón grande que abre WhatsApp con el pedido ya escrito. Al tocarlo,
 * el icono se vuelve un visto, una mariposa sale volando y abajo se explica el último paso.
 */
export function BotonEnviar({ href }) {
  const menos = useMenosMovimiento()
  const [enviado, setEnviado] = useState(0)

  useEffect(() => {
    if (!enviado) return undefined
    const reloj = window.setTimeout(() => setEnviado(0), 4200)
    return () => window.clearTimeout(reloj)
  }, [enviado])

  return (
    <div className="relative">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setEnviado(Date.now())}
        data-bolsa-enviar
        className="boton boton-oscuro group min-h-[3.75rem] w-full justify-start gap-3 whitespace-normal py-2 pl-2 pr-5 text-left text-[0.97rem] normal-case leading-tight tracking-[0.01em] shadow-[0_18px_36px_-18px_rgb(21_18_18/0.7)]"
      >
        <span className="bolsa-brillo" aria-hidden="true" />
        <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-camel text-papel">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={enviado ? 'listo' : 'wa'}
              className="grid place-items-center"
              initial={{ scale: 0.3, opacity: 0, rotate: enviado ? -60 : 0 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ duration: 0.35, ease: EXPO }}
            >
              {enviado ? <Check className="size-5" strokeWidth={2.2} /> : <IconoWhatsApp className="size-[1.35rem]" />}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="relative flex-1 font-medium">{enviado ? 'Abriendo WhatsApp…' : 'Enviar pedido por WhatsApp'}</span>
        <ArrowRight className="relative size-5 shrink-0 transition-transform max-[374px]:hidden duration-500 ease-expo group-hover:translate-x-1" strokeWidth={1.5} />
      </a>

      {/* La mariposa lleva el pedido. */}
      <AnimatePresence>
        {enviado && !menos ? (
          <motion.span
            key={enviado}
            aria-hidden="true"
            className="pointer-events-none absolute left-5 top-1 w-7 text-camel"
            initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], x: [0, 40, 110, 170], y: [0, -50, -120, -190], rotate: [0, -18, 8, -12], scale: [0.6, 1, 1.15, 1.3] }}
            transition={{ duration: 1.6, ease: 'easeOut', times: [0, 0.2, 0.6, 1] }}
          >
            <Mariposa grosor={1.5} />
          </motion.span>
        ) : null}
      </AnimatePresence>

      <div className="mt-3 grid min-h-5 place-items-center text-center text-[0.8rem] leading-snug text-tinta/60" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={enviado ? 'paso' : 'calma'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
            {enviado ? 'Tu pedido ya va escrito: en WhatsApp solo toca Enviar 💕' : TRANQUILIDAD}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** Estado vacío: la mariposa del logo se dibuja dentro de una órbita y te invita a explorar. */
export function BolsaVacia({ alExplorar }) {
  return (
    <motion.div
      className="flex flex-col items-center px-2 pb-10 pt-4 text-center md:my-auto md:pb-24"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EXPO, delay: 0.1 } }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <div className="relative grid size-40 place-items-center md:size-48">
        <span className="absolute inset-4 rounded-full bg-rosa/70" />
        <span className="bolsa-orbita absolute inset-0 rounded-full border border-dashed border-camel/50" />
        <span className="absolute right-3 top-6 size-1.5 rounded-full bg-camel/70" />
        <Mariposa animado retraso={0.25} className="relative w-[4.5rem] translate-x-1 text-cafe md:w-20" />
      </div>
      <h3 className="mt-7 max-w-[14ch] font-display text-[2.1rem] leading-[1] text-balance md:text-[2.5rem]">
        Está esperando algo <em className="enfasis">lindo</em>
      </h3>
      <p className="mt-4 max-w-[30ch] text-[0.97rem] leading-relaxed text-tinta/70">
        Guarda aquí las prendas que te enamoren y pídelas todas juntas por WhatsApp.
      </p>
      <button type="button" onClick={alExplorar} className="boton boton-oscuro mt-8">
        Ver la colección
      </button>
      <a
        href={enlaceWhatsApp(mensajeGeneral())}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex min-h-11 items-center gap-2 text-[0.9rem] text-tinta/70 underline decoration-tinta/25 underline-offset-4 transition-colors hover:text-tinta hover:decoration-current"
      >
        <IconoWhatsApp className="size-4" />
        ¿Prefieres asesoría? Escríbenos
      </a>
    </motion.div>
  )
}
