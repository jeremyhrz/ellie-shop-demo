/**
 * Iconos de marca que lucide no trae. Toman el color del texto; dales tamaño con className
 * (p. ej. "size-5"). Son decorativos: el texto del botón o un aria-label dice qué hacen.
 */

export function IconoWhatsApp({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12.04 2C6.57 2 2.13 6.43 2.13 11.9c0 1.75.46 3.45 1.33 4.95L2.05 22l5.3-1.39a9.9 9.9 0 0 0 4.69 1.19h.01c5.46 0 9.9-4.43 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.83 9.83 0 0 0 12.04 2Zm0 18.13h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.14.83.84-3.06-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.26-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.17.25-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.31c-.23.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.74 2.65 4.2 3.72.59.25 1.05.4 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.47-.29Z" />
    </svg>
  )
}

export function IconoInstagram({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}
