import { useMemo, useState } from 'react'
import { ToastContext } from './toastContext.js'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const value = useMemo(() => {
    return {
      pushToast: ({ type = 'success', title = '', message = '' }) => {
        const id = crypto.randomUUID?.() ?? String(Date.now() + Math.random())
        const toast = { id, type, title, message }
        setToasts((t) => [toast, ...t].slice(0, 4))
        window.setTimeout(() => {
          setToasts((t) => t.filter((x) => x.id !== id))
        }, 4500)
      },
    }
  }, [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => {
          const theme =
            t.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : t.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-900'
                : t.type === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-slate-200 bg-slate-50 text-slate-900'

          return (
            <div
              key={t.id}
              className={[
                'pointer-events-auto rounded-xl border px-3 py-2 shadow-sm',
                theme,
              ].join(' ')}
            >
              {t.title ? (
                <div className="text-sm font-semibold">{t.title}</div>
              ) : null}
              {t.message ? <div className="text-sm">{t.message}</div> : null}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
