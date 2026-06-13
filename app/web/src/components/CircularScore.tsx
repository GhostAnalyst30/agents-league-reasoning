import { useEffect, useState } from 'react'

export function CircularScore({
  value,
  color,
  size = 92,
  stroke = 9,
  label,
}: {
  value: number
  color: string
  size?: number
  stroke?: number
  label?: string
}) {
  const [shown, setShown] = useState(0)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - shown * c

  useEffect(() => {
    const t = setTimeout(() => setShown(value), 80)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-white/[0.08]" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-lg font-bold tabular-nums text-white">
          {Math.round(shown * 100)}
          <span className="text-xs">%</span>
        </span>
        {label ? <span className="text-[10px] text-slate-500">{label}</span> : null}
      </div>
    </div>
  )
}
