import { motion } from 'framer-motion'
import { PRODUCT_NAME } from '../branding'
import ParticleField from '../components/ParticleField'

interface PitchShellProps {
  children: React.ReactNode
  index: number
  total: number
  interacted: boolean
  onNext: () => void
  onPrev: () => void
  particles?: boolean
  burst?: boolean
  title?: string
}

export default function PitchShell({
  children,
  index,
  total,
  interacted,
  onNext,
  onPrev,
  particles = true,
  burst = false,
  title = PRODUCT_NAME,
}: PitchShellProps) {
  const progress = ((index + 1) / total) * 100

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ink-950">
      {particles && <ParticleField burst={burst} />}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#070b14_75%)]" />

      <div className="absolute left-6 top-6 z-30 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        <span className="h-2 w-2 rounded-full bg-azure-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
        {title}
      </div>

      <main className="relative z-10 h-full w-full">{children}</main>

      {/* Click zones */}
      <button
        type="button"
        aria-label="Previous scene"
        onClick={onPrev}
        disabled={index === 0}
        className="absolute left-0 top-0 z-20 h-full w-1/4 cursor-w-resize opacity-0 disabled:cursor-default"
      />
      <button
        type="button"
        aria-label="Next scene"
        onClick={onNext}
        disabled={index === total - 1}
        className="absolute right-0 top-0 z-20 h-full w-1/4 cursor-e-resize opacity-0 disabled:cursor-default"
      />

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-8 pb-6">
        <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-slate-500">
          <span>
            Scene {index + 1} / {total}
          </span>
          {!interacted && (
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Press → or Space to continue · F for fullscreen
            </motion.span>
          )}
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-azure-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  )
}
