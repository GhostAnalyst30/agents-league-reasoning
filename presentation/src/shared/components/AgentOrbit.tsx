import { motion } from 'framer-motion'

const AGENTS = [
  { label: 'Planner Agent', angle: 0, color: '#38bdf8' },
  { label: 'Knowledge Agent', angle: 60, color: '#6366f1' },
  { label: 'Assessment Agent', angle: 120, color: '#22d3ee' },
  { label: 'Progress Agent', angle: 180, color: '#f59e0b' },
  { label: 'Policy Agent', angle: 240, color: '#a78bfa' },
  { label: 'Critic Agent', angle: 300, color: '#f472b6' },
]

const RADIUS = 140

interface AgentOrbitProps {
  showLabels?: boolean
  showConnections?: boolean
}

export default function AgentOrbit({ showLabels = true, showConnections = false }: AgentOrbitProps) {
  return (
    <div className="relative flex h-[400px] w-[400px] items-center justify-center md:h-[480px] md:w-[480px]">
      <motion.div
        animate={{
          boxShadow: [
            '0 0 60px rgba(56,189,248,0.4)',
            '0 0 100px rgba(99,102,241,0.6)',
            '0 0 60px rgba(56,189,248,0.4)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute z-10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-azure-500"
      >
        <span className="text-center text-[10px] font-bold leading-tight text-white">
          Shared
          <br />
          Core
        </span>
      </motion.div>

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0"
      >
        {AGENTS.map(({ label, angle, color }) => {
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * RADIUS
          const y = Math.sin(rad) * RADIUS
          return (
            <div key={label}>
              {showConnections && (
                <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`calc(50% + ${x}px)`}
                    y2={`calc(50% + ${y}px)`}
                    stroke={color}
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />
                </svg>
              )}
              <motion.div
                style={{ x, y }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                whileHover={{ scale: 1.1 }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 shadow-lg"
                  style={{ backgroundColor: `${color}22`, borderColor: `${color}55` }}
                >
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                </div>
                {showLabels && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute left-1/2 mt-2 w-28 -translate-x-1/2 text-center text-[10px] font-semibold text-slate-300"
                  >
                    {label}
                  </motion.p>
                )}
              </motion.div>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
