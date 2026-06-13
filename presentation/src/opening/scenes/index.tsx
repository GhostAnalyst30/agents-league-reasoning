import { motion } from 'framer-motion'
import { PRODUCT_NAME } from '../../shared/branding'
import { AlertTriangle, EyeOff, HelpCircle, Users, Wallet, XCircle } from 'lucide-react'
import CalendarOverload from '../../shared/components/CalendarOverload'
import CinematicText from '../../shared/components/CinematicText'
import CounterUp from '../../shared/components/CounterUp'
import GaugeMeter from '../../shared/components/GaugeMeter'
import GlowLogo from '../../shared/components/GlowLogo'
import { staggerContainer, textReveal } from '../../shared/motion/presets'

export function DarkIntro() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="text-center"
    >
      <p className="text-sm font-medium uppercase tracking-[0.4em] text-slate-600">Microsoft Foundry</p>
    </motion.div>
  )
}

export function BudgetCounter() {
  return (
    <div className="text-center">
      <CinematicText className="mb-8 max-w-2xl text-xl font-medium text-slate-400 md:text-2xl" as="p" delay={0}>
        Imagine this: your company spends
      </CinematicText>
      <CounterUp target={2000000} label="Cloud Certification Program" />
    </div>
  )
}

export function CompletionGauge() {
  return (
    <div className="flex flex-col items-center gap-8">
      <CinematicText className="text-lg text-slate-400" as="p" delay={0}>
        Six months later — completion rate:
      </CinematicText>
      <GaugeMeter values={[100, 76, 51, 23]} />
    </div>
  )
}

export function PauseTwentyThree() {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="text-center"
    >
      <p className="font-mono text-[10rem] font-black leading-none text-red-400 drop-shadow-[0_0_40px_rgba(239,68,68,0.6)] md:text-[12rem]">
        23%
      </p>
      <p className="mt-4 text-lg font-medium text-red-300/80">Completion Rate</p>
    </motion.div>
  )
}

export function SoundFamiliar() {
  return (
    <CinematicText className="text-5xl font-bold italic text-white md:text-7xl" as="h1">
      Sound familiar?
    </CinematicText>
  )
}

export function FailureCalendars() {
  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-6">
      <CinematicText className="text-2xl font-bold text-red-300 md:text-3xl" as="h2" delay={0}>
        Failure #1: Generic Study Plans
      </CinematicText>
      <CalendarOverload />
    </div>
  )
}

export function FailureFeedback() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center">
      <motion.h2 variants={textReveal} className="mb-8 text-2xl font-bold text-red-300 md:text-3xl">
        Failure #2: No Feedback Loop
      </motion.h2>
      <div className="mb-8 flex justify-center gap-4">
        {[1, 2, 3].map((n) => (
          <motion.div
            key={n}
            variants={textReveal}
            className="glass-panel flex h-24 w-32 flex-col items-center justify-center border-red-400/30"
          >
            <XCircle className="text-red-400" size={28} />
            <span className="mt-2 text-xs font-bold text-red-300">Failed {n}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center gap-12">
        {['Alone', 'Quit'].map((word) => (
          <motion.span
            key={word}
            variants={textReveal}
            className="text-4xl font-black uppercase tracking-wider text-slate-500 md:text-6xl"
          >
            {word}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}

export function FailureVisibility() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center">
      <motion.h2 variants={textReveal} className="mb-8 text-2xl font-bold text-amber-300 md:text-3xl">
        Failure #3: Zero Visibility
      </motion.h2>
      <motion.div variants={textReveal} className="glass-panel mx-auto max-w-lg p-8">
        <div className="mb-4 flex items-center justify-center gap-2 text-slate-400">
          <EyeOff size={20} />
          <span className="text-sm font-semibold">Manager Dashboard</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['???', '—', '???'].map((v, i) => (
            <div key={i} className="flex h-16 items-center justify-center rounded-lg bg-white/[0.04] text-2xl text-slate-600">
              {v}
            </div>
          ))}
        </div>
        <HelpCircle className="mx-auto mt-6 text-amber-400/60" size={32} />
      </motion.div>
      <motion.p variants={textReveal} className="mt-8 text-3xl font-bold text-white md:text-4xl">
        &ldquo;Who is exam-ready?&rdquo;
      </motion.p>
    </motion.div>
  )
}

export function CrisisMerge() {
  const items = [
    { icon: Wallet, label: 'Wasted Budget', color: 'text-red-400' },
    { icon: Users, label: 'Frustrated Teams', color: 'text-amber-400' },
    { icon: AlertTriangle, label: 'Low Certification Impact', color: 'text-orange-400' },
  ]
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center">
      <motion.p variants={textReveal} className="mb-10 text-lg text-slate-400">
        Three failures. One crisis.
      </motion.p>
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        {items.map(({ icon: Icon, label, color }) => (
          <motion.div
            key={label}
            variants={textReveal}
            className="glass-panel flex flex-col items-center gap-3 border-red-400/20 px-10 py-8"
          >
            <Icon size={36} className={color} />
            <span className={`text-lg font-bold ${color}`}>{label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export function HopeEmergence() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2.5, 4], opacity: [0, 0.9, 0.5] }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute h-48 w-48 rounded-full md:h-64 md:w-64"
        style={{
          background:
            'radial-gradient(circle, rgba(56,189,248,0.6) 0%, rgba(99,102,241,0.25) 45%, transparent 70%)',
        }}
      />
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="relative z-10 text-xl font-medium text-azure-300 md:text-2xl"
      >
        There is a better way.
      </motion.p>
    </div>
  )
}

export function LogoReveal() {
  return <GlowLogo size="xl" />
}

export function OpeningClose() {
  return (
    <div className="text-center">
      <GlowLogo size="md" showIcon={false} />
      <CinematicText className="mt-8 text-2xl font-semibold text-azure-300 md:text-3xl" as="p" delay={0.3}>
        Fixing all three problems at once.
      </CinematicText>
      <motion.a
        href="/closing.html"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-10 inline-block text-sm text-slate-500 underline-offset-4 hover:text-azure-400 hover:underline"
      >
        Continue to {PRODUCT_NAME}. →
      </motion.a>
    </div>
  )
}
