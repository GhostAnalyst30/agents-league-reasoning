import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface GaugeMeterProps {
  values: number[]
  holdOnLast?: boolean
  label?: string
  dangerBelow?: number
}

export default function GaugeMeter({
  values,
  holdOnLast = false,
  label = 'Completion Rate',
  dangerBelow = 30,
}: GaugeMeterProps) {
  const [step, setStep] = useState(0)
  const current = values[Math.min(step, values.length - 1)]
  const isDanger = current <= dangerBelow
  const circumference = 2 * Math.PI * 90
  const offset = circumference - (current / 100) * circumference

  useEffect(() => {
    if (step >= values.length - 1) return
    const delay = step === values.length - 2 && holdOnLast ? 1200 : 700
    const t = setTimeout(() => setStep((s) => s + 1), delay)
    return () => clearTimeout(t)
  }, [step, values.length, holdOnLast])

  return (
    <div className="glass-panel flex flex-col items-center px-12 py-10">
      <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="relative">
        <svg width="220" height="220" className="-rotate-90">
          <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          <motion.circle
            cx="110"
            cy="110"
            r="90"
            fill="none"
            stroke={isDanger ? '#ef4444' : '#38bdf8'}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              filter: isDanger ? 'drop-shadow(0 0 12px rgba(239,68,68,0.6))' : 'drop-shadow(0 0 12px rgba(56,189,248,0.5))',
            }}
          />
        </svg>
        <motion.div
          key={current}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className={`font-mono text-5xl font-bold ${isDanger ? 'text-red-400' : 'text-white'}`}>
            {current}%
          </span>
        </motion.div>
      </div>
    </div>
  )
}
