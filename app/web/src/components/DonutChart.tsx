import { useEffect, useState } from 'react'

type Slice = { label: string; value: number; color: string }

export function DonutChart({ data, size = 168 }: { data: Slice[]; size?: number }) {
  const [grow, setGrow] = useState(0)
  const total = data.reduce((s, d) => s + d.value, 0)
  const stroke = 22
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r

  useEffect(() => {
    const t = setTimeout(() => setGrow(1), 120)
    return () => clearTimeout(t)
  }, [])

  let acc = 0

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-white/[0.08]" />
          {data.map((d) => {
            const frac = (d.value / total) * grow
            const dash = frac * c
            const seg = (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-acc * c}
                style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)' }}
              />
            )
            acc += (d.value / total) * grow
            return seg
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-bold text-white">{total}</span>
          <span className="text-[10px] uppercase tracking-wide text-slate-500">certs</span>
        </div>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-xs">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="text-slate-400">{d.label}</span>
            <span className="ml-auto font-medium tabular-nums text-white">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
