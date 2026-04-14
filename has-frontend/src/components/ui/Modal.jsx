import { useEffect } from 'react'

export default function Modal({
  open,
  title,
  children,
  onClose,
  footer,
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        className="absolute inset-0 bg-slate-900/40"
        onClick={() => onClose?.()}
        aria-label="Close modal"
        type="button"
      />
      <div
        className="relative w-[720px] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title ? (
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div id="modal-title" className="text-sm font-semibold text-slate-900">
              {title}
            </div>
            <button
              type="button"
              onClick={() => onClose?.()}
              className="rounded-lg px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        ) : null}
        <div className="px-4 py-4">{children}</div>
        {footer ? <div className="border-t border-slate-200 px-4 py-3">{footer}</div> : null}
      </div>
    </div>
  )
}

