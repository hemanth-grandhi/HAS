export default function Select({
  label,
  hint,
  error,
  className = '',
  containerClassName = '',
  options = [],
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label ? (
        <label className="mb-1 block text-sm font-medium text-slate-800">
          {label}
        </label>
      ) : null}
      <select
        className={[
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900',
          'focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100',
          error ? 'border-rose-400 focus:ring-rose-100' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
      {error ? (
        <div className="mt-1 text-xs font-medium text-rose-600">{error}</div>
      ) : null}
    </div>
  )
}

