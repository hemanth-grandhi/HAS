export default function OccupancyChart({ points = [], mode = 'line' }) {
  const width = 900
  const height = 260
  const pad = 30

  const maxY = 100
  const minY = 0

  const xStep = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0
  const yFor = (y) => {
    const pct = (Number(y) - minY) / (maxY - minY)
    return height - pad - pct * (height - pad * 2)
  }

  const gridLines = [0, 25, 50, 75, 100]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {gridLines.map((g) => (
          <g key={g}>
            <line
              x1={pad}
              y1={yFor(g)}
              x2={width - pad}
              y2={yFor(g)}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <text x={10} y={yFor(g) + 4} fontSize="12" fill="#64748b">
              {g}%
            </text>
          </g>
        ))}

        {mode === 'bar' ? (
          <g>
            {points.map((p, idx) => {
              const x = pad + idx * xStep
              const barW = points.length > 0 ? Math.max(8, xStep * 0.6) : 8
              const y = yFor(p.occupancyPct)
              const h = height - pad - y
              return (
                <rect
                  key={p.dayISO}
                  x={x - barW / 2}
                  y={y}
                  width={barW}
                  height={h}
                  rx="6"
                  fill="#4f46e5"
                  opacity="0.85"
                />
              )
            })}
          </g>
        ) : (
          <g>
            {/* line */}
            {points.length ? (
              <>
                <polyline
                  points={points
                    .map((p, idx) => {
                      const x = pad + idx * xStep
                      const y = yFor(p.occupancyPct)
                      return `${x},${y}`
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* glow */}
                <polyline
                  points={points
                    .map((p, idx) => {
                      const x = pad + idx * xStep
                      const y = yFor(p.occupancyPct)
                      return `${x},${y}`
                    })
                    .join(' ')}
                  fill="none"
                  stroke="url(#lineGlow)"
                  strokeWidth="10"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                {/* points */}
                {points.map((p, idx) => {
                  const x = pad + idx * xStep
                  const y = yFor(p.occupancyPct)
                  return (
                    <g key={p.dayISO}>
                      <circle cx={x} cy={y} r="6" fill="#4f46e5" opacity="0.9" />
                      <circle cx={x} cy={y} r="10" fill="#4f46e5" opacity="0.08" />
                    </g>
                  )
                })}
              </>
            ) : null}
          </g>
        )}

        {/* x labels (light) */}
        {points.map((p, idx) => {
          const show = points.length <= 8 ? true : idx % 2 === 0
          if (!show) return null
          const x = pad + idx * xStep
          return (
            <text key={p.dayISO + '-label'} x={x} y={height - 8} fontSize="12" textAnchor="middle" fill="#64748b">
              {p.dateLabel}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

