export default function Table({ children }) {
  return (
    <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-[900px] w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  )
}

