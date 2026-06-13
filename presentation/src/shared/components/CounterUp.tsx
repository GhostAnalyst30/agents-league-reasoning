import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface CounterUpProps {
  target: number
  prefix?: string
  duration?: number
  label?: string
}

export default function CounterUp({
  target,
  prefix = '$',
  duration = 2,
  label,
}: CounterUpProps) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.floor(eased * target))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 80 }}
        className="font-mono text-6xl font-bold tracking-tight text-white md:text-8xl"
      >
        {prefix}
        {value.toLocaleString('en-US')}
      </motion.div>
      {label && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-4 text-lg font-medium uppercase tracking-[0.25em] text-azure-400"
        >
          {label}
        </motion.p>
      )}
    </div>
  )
}
