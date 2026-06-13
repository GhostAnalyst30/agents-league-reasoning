import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Calendar } from 'lucide-react'
import { staggerContainer, textReveal } from '../motion/presets'

const MEETINGS = [
  { day: 'Mon', blocks: [9, 10, 11, 14, 15, 16] },
  { day: 'Tue', blocks: [8, 9, 10, 11, 13, 14, 15, 16, 17] },
  { day: 'Wed', blocks: [9, 10, 14, 15, 16] },
  { day: 'Thu', blocks: [8, 9, 10, 11, 12, 14, 15, 16] },
  { day: 'Fri', blocks: [9, 10, 11, 14, 15] },
]

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

export default function CalendarOverload() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full max-w-3xl">
      <motion.div variants={textReveal} className="mb-6 text-center">
        <span className="chip rounded-full border border-red-400/30 bg-red-500/10 px-4 py-1.5 text-sm font-bold text-red-300">
          22 Hours of Meetings Per Week
        </span>
      </motion.div>

      <motion.div variants={textReveal} className="glass-panel overflow-hidden p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Calendar size={16} className="text-azure-400" />
          Overloaded Calendar
        </div>
        <div className="grid grid-cols-6 gap-1 text-center text-[10px] text-slate-500">
          <div />
          {HOURS.map((h) => (
            <div key={h}>{h}:00</div>
          ))}
          {MEETINGS.map(({ day, blocks }) => (
            <Fragment key={day}>
              <div className="py-2 font-semibold text-slate-400">
                {day}
              </div>
              {HOURS.map((h) => (
                <motion.div
                  key={`${day}-${h}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: blocks.includes(h) ? 1 : 0.15,
                    scale: blocks.includes(h) ? 1 : 0.9,
                    backgroundColor: blocks.includes(h) ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.03)',
                  }}
                  transition={{ delay: blocks.includes(h) ? blocks.indexOf(h) * 0.08 : 0 }}
                  className="h-8 rounded-md"
                />
              ))}
            </Fragment>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={textReveal}
        animate={{ x: [0, 20, 40], opacity: [1, 0.5, 0] }}
        transition={{ delay: 1.5, duration: 1.2 }}
        className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500"
      >
        <BookOpen size={14} className="text-indigo-400" />
        <span className="line-through">Study block squeezed out</span>
      </motion.div>
    </motion.div>
  )
}
