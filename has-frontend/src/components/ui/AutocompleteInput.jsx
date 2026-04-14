import { useId } from 'react'

export default function AutocompleteInput({
  label,
  hint,
  error,
  options = [],
  className = '',
  containerClassName = '',
  ...props
}) {
  const listId = useId()

  return (
    <div className={containerClassName}>
      {label ? (
        <label className="mb-1 block text-sm font-medium text-slate-800">
          {label}
        </label>
      ) : null}
      <input
        list={listId}
        className={[
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
          'focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100',
          error ? 'border-rose-400 focus:ring-rose-100' : '',
          className,
        ].join(' ')}
        {...props}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label ?? option.value}
          </option>
        ))}
      </datalist>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
      {error ? (
        <div className="mt-1 text-xs font-medium text-rose-600">{error}</div>
      ) : null}
    </div>
  )
}
