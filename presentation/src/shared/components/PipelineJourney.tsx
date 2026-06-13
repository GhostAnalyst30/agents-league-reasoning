import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { staggerContainer, textReveal } from '../motion/presets'

const STEPS = ['Reason', 'Retrieve', 'Plan', 'Assess', 'Verify', 'Critic Review']

export default function PipelineJourney() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex w-full max-w-5xl flex-col items-center gap-8 md:flex-row md:items-stretch md:gap-4"
    >
      <motion.div variants={textReveal} className="glass-panel flex flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Start</p>
        <p className="mt-3 text-xl font-bold text-white md:text-2xl">
          &ldquo;I want to get certified&rdquo;
        </p>
      </motion.div>

      <motion.div variants={textReveal} className="hidden text-azure-400 md:block">
        <ArrowRight size={28} />
      </motion.div>

      <motion.div variants={textReveal} className="glass-panel flex-[1.4] p-6">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-azure-400">
          Multi-Agent Reasoning
        </p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-center text-xs font-semibold text-indigo-200"
            >
              {step}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={textReveal} className="hidden text-azure-400 md:block">
        <ArrowRight size={28} />
      </motion.div>

      <motion.div variants={textReveal} className="glass-panel flex flex-1 flex-col items-center justify-center p-8 text-center">
        <CheckCircle2 size={40} className="text-emerald-400" />
        <p className="mt-4 text-2xl font-black text-emerald-300">Exam Ready</p>
        <motion.p
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="mt-2 font-mono text-4xl font-bold text-white"
        >
          100%
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
