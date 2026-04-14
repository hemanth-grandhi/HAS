export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60'

  const theme =
    variant === 'primary'
      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
      : variant === 'secondary'
        ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
        : variant === 'danger'
          ? 'bg-rose-600 text-white hover:bg-rose-700'
          : variant === 'ghost'
            ? 'bg-transparent text-slate-700 hover:bg-slate-100'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'

  return (
    <button className={`${base} ${theme} ${className}`} {...props}>
      {children}
    </button>
  )
}

