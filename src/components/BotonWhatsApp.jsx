import clsx from 'clsx'
import Magnetico from './Magnetico'
import { IconoWhatsApp } from './Iconos'
import { enlaceWhatsApp, mensajeGeneral } from '../lib/whatsapp'

/**
 * Botón que abre WhatsApp con el mensaje ya escrito.
 *
 *   <BotonWhatsApp />                                                    «Escríbenos», mensaje general
 *   <BotonWhatsApp mensaje={mensajeProducto({ producto, color, talla })}>Pedir por WhatsApp</BotonWhatsApp>
 *   <BotonWhatsApp variante="claro" magnetico />                         sobre fondo oscuro, atraído por el cursor
 *
 * `variante`: 'oscuro' (sobre claro) · 'claro' (sobre oscuro) · 'linea' (borde del color del texto).
 */
export default function BotonWhatsApp({
  mensaje,
  children = 'Escríbenos',
  variante = 'oscuro',
  icono = true,
  magnetico = false,
  className,
  ...resto
}) {
  const boton = (
    <a
      href={enlaceWhatsApp(mensaje ?? mensajeGeneral())}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx('boton', `boton-${variante}`, className)}
      {...resto}
    >
      {icono && <IconoWhatsApp className="size-[1.2em] shrink-0" />}
      <span>{children}</span>
    </a>
  )
  return magnetico ? <Magnetico>{boton}</Magnetico> : boton
}
