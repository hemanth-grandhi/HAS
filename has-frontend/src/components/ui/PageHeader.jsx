export default function PageHeader({ title, subtitle }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-teal-800 to-amber-600 p-6 text-white shadow-lg shadow-slate-900/10">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-200">{subtitle}</p>
    </div>
  )
}
