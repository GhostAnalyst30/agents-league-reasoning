import { motion } from 'framer-motion'
import AgentOrbit from '../../shared/components/AgentOrbit'
import CinematicText from '../../shared/components/CinematicText'
import GlowLogo from '../../shared/components/GlowLogo'
import ParticleField from '../../shared/components/ParticleField'
import PipelineJourney from '../../shared/components/PipelineJourney'
import { cameraZoom, textReveal } from '../../shared/motion/presets'

export function MotivationLine() {
  return (
    <CinematicText className="max-w-4xl text-center text-3xl font-semibold leading-snug text-slate-200 md:text-5xl" as="p">
      Certifications don&apos;t fail because people lack motivation.
    </CinematicText>
  )
}

export function SystemBroken() {
  return (
    <motion.div variants={cameraZoom} initial="hidden" animate="visible" className="max-w-4xl text-center">
      <p className="text-3xl font-semibold text-slate-400 md:text-5xl">
        They fail because{' '}
        <span className="text-gradient font-bold">the system around the learner is broken.</span>
      </p>
    </motion.div>
  )
}

function IntimidatingWord({ word, color }: { word: string; color: string }) {
  return (
    <motion.h1
      initial={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="text-center font-black uppercase tracking-tighter md:text-[10rem]"
      style={{ color, textShadow: `0 0 80px ${color}66` }}
    >
      {word}
    </motion.h1>
  )
}

export function WordGeneric() {
  return <IntimidatingWord word="Generic" color="#ef4444" />
}

export function WordUngrounded() {
  return <IntimidatingWord word="Ungrounded" color="#f59e0b" />
}

export function WordUnaccountable() {
  return <IntimidatingWord word="Unaccountable" color="#a78bfa" />
}

export function WordShatter() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <ParticleField count={120} burst />
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 1.5, filter: 'blur(30px)' }}
        transition={{ duration: 1 }}
        className="flex flex-col gap-4 text-center"
      >
        <span className="text-4xl font-black text-red-400/60 line-through md:text-6xl">GENERIC</span>
        <span className="text-4xl font-black text-amber-400/60 line-through md:text-6xl">UNGROUNDED</span>
        <span className="text-4xl font-black text-violet-400/60 line-through md:text-6xl">UNACCOUNTABLE</span>
      </motion.div>
    </div>
  )
}

export function LogoReveal() {
  return <GlowLogo size="xl" showSub />
}

export function AgentOrbitScene() {
  return (
    <div className="flex flex-col items-center gap-4">
      <AgentOrbit showLabels />
      <CinematicText className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500" as="p" delay={0.5}>
        Multi-Agent Reasoning Architecture
      </CinematicText>
    </div>
  )
}

export function SharedIntelligence() {
  return (
    <div className="flex flex-col items-center gap-6">
      <AgentOrbit showLabels showConnections />
      <CinematicText className="text-3xl font-bold text-gradient md:text-5xl" as="h2" delay={0.3}>
        Shared Intelligence
      </CinematicText>
    </div>
  )
}

function TitleCard({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div variants={cameraZoom} initial="hidden" animate="visible" className="text-center">
      <h2 className="text-5xl font-black text-white md:text-7xl">{title}</h2>
      {subtitle && (
        <motion.p
          variants={textReveal}
          initial="hidden"
          animate="visible"
          className="mt-4 text-lg text-slate-400"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}

export function BusinessRules() {
  return <TitleCard title="Business Rules" subtitle="BR-001 through BR-005 — enforced in code" />
}

export function CriticGate() {
  return <TitleCard title="Critic Gate" subtitle="Every output reviewed before it ships" />
}

export function MeasurableEvals() {
  return <TitleCard title="Measurable Evals" subtitle="Groundedness · Compliance · Citations" />
}

export function CertificationJourney() {
  return <PipelineJourney />
}

export function HeroTagline() {
  return (
    <div className="text-center">
      <GlowLogo size="lg" />
      <CinematicText className="mt-8 max-w-3xl text-2xl font-semibold text-slate-300 md:text-3xl" as="p" delay={0.4}>
        From &ldquo;I want to get certified&rdquo; to exam-ready.
      </CinematicText>
    </div>
  )
}

function EmphasisWord({ word, color }: { word: string; color: string }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 60, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="text-center text-7xl font-black md:text-9xl"
      style={{ color }}
    >
      {word}.
    </motion.h1>
  )
}

export function Grounded() {
  return <EmphasisWord word="Grounded" color="#38bdf8" />
}

export function Validated() {
  return <EmphasisWord word="Validated" color="#6366f1" />
}

export function Approved() {
  return <EmphasisWord word="Approved" color="#22d3ee" />
}

export function ThankYou() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 4, times: [0, 0.7, 1] }}
      className="text-center"
    >
      <CinematicText className="text-6xl font-black text-white md:text-8xl" as="h1">
        Thank You
      </CinematicText>
      <CinematicText className="mt-6 text-xl text-slate-400 md:text-2xl" as="p" delay={0.4}>
        Happy to run a live pipeline demonstration.
      </CinematicText>
      
    </motion.div>
  )
}
