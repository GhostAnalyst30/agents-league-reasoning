import { motion } from 'framer-motion'
import AgentOrbit from '../../shared/components/AgentOrbit'
import {
  CLOSING_LEAD,
  CLOSING_PROMISE,
  HERO_LINE,
  PITCH_TAGLINE,
  PRODUCT_NAME,
} from '../../shared/branding'
import CinematicText from '../../shared/components/CinematicText'
import GlowLogo from '../../shared/components/GlowLogo'
import PipelineJourney from '../../shared/components/PipelineJourney'
import { cameraZoom, staggerContainer, textReveal } from '../../shared/motion/presets'

export function CertToExamReady() {
  return (
    <CinematicText
      className="max-w-4xl text-center text-2xl font-semibold leading-snug text-slate-200 md:text-4xl"
      as="p"
    >
      {CLOSING_LEAD}
    </CinematicText>
  )
}

export function GroundedValidatedGated() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex max-w-3xl flex-col gap-5 text-center"
    >
      {CLOSING_PROMISE.split('. ').map((line, i) => (
        <motion.p
          key={line}
          variants={textReveal}
          custom={i * 0.15}
          className="text-xl font-medium text-slate-300 md:text-2xl"
        >
          {line.endsWith('.') ? line : `${line}.`}
        </motion.p>
      ))}
    </motion.div>
  )
}

export function NotAChatbot() {
  return (
    <div className="max-w-4xl text-center">
      <CinematicText className="text-2xl font-medium text-slate-500 md:text-3xl" as="p" delay={0}>
        This is not
      </CinematicText>
      <motion.h1
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 text-4xl font-black uppercase tracking-tight text-red-400/90 line-through decoration-red-400/60 md:text-6xl"
      >
        a chatbot with a certification skin
      </motion.h1>
    </div>
  )
}

export function SixAgentsTeam() {
  return (
    <div className="flex flex-col items-center gap-6">
      <CinematicText className="max-w-3xl text-center text-2xl font-bold text-white md:text-4xl" as="h2" delay={0}>
        Six specialized AI agents working as a team
      </CinematicText>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.8 }}
      >
        <AgentOrbit showLabels />
      </motion.div>
    </div>
  )
}

export function SharedGroundedBrain() {
  return (
    <div className="flex flex-col items-center gap-6">
      <AgentOrbit showLabels showConnections />
      <CinematicText className="text-3xl font-bold text-gradient md:text-5xl" as="h2" delay={0.3}>
        One grounded brain
      </CinematicText>
      <CinematicText className="max-w-2xl text-center text-lg text-slate-400 md:text-xl" as="p" delay={0.55}>
        Shared intelligence across every agent — not six disconnected prompts.
      </CinematicText>
    </div>
  )
}

export function FrameworkOrchestration() {
  return (
    <motion.div variants={cameraZoom} initial="hidden" animate="visible" className="max-w-4xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">Orchestrated by</p>
      <h2 className="mt-6 text-3xl font-black text-white md:text-5xl">Microsoft Agent Framework</h2>
      <p className="mt-4 text-2xl font-bold text-gradient md:text-4xl">+ Microsoft Foundry</p>
      <motion.p
        variants={textReveal}
        initial="hidden"
        animate="visible"
        className="mt-8 text-lg text-slate-400 md:text-xl"
      >
        Reasoning agents with enterprise-grade grounding and governance.
      </motion.p>
    </motion.div>
  )
}

export function NoGuessing() {
  return (
    <CinematicText className="max-w-3xl text-center text-3xl font-bold text-white md:text-5xl" as="h2">
      When a learner asks for help, {PRODUCT_NAME} does not guess.
    </CinematicText>
  )
}

const REASONING_VERBS = ['Reasons', 'Retrieves', 'Plans', 'Assesses', 'Verifies']

export function ReasoningVerbs() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
    >
      {REASONING_VERBS.map((verb, i) => (
        <motion.span
          key={verb}
          variants={textReveal}
          custom={i * 0.1}
          className="glass-panel rounded-lg px-5 py-3 text-lg font-bold text-indigo-200 md:text-2xl"
        >
          {verb}
        </motion.span>
      ))}
    </motion.div>
  )
}

export function LivePipeline() {
  return (
    <div className="flex w-full max-w-5xl flex-col items-center gap-8">
      <PipelineJourney />
      <CinematicText className="max-w-2xl text-center text-xl font-semibold text-slate-300 md:text-2xl" as="p" delay={0.5}>
        In a live pipeline you can watch in real time.
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
  return <TitleCard title="Business Rules" subtitle="Every plan validated against BR-001 through BR-005" />
}

export function CriticGate() {
  return <TitleCard title="Critic Gate" subtitle="Every answer gated before it ships" />
}

export function MeasurableEvals() {
  return <TitleCard title="Measurable Evals" subtitle="Groundedness · Compliance · Citations" />
}

export function HeroTagline() {
  return (
    <div className="text-center">
      <GlowLogo size="lg" />
      <CinematicText className="mt-8 max-w-3xl text-2xl font-semibold text-slate-300 md:text-3xl" as="p" delay={0.4}>
        {HERO_LINE}
      </CinematicText>
      <CinematicText className="mt-4 max-w-2xl text-lg font-medium text-slate-500 md:text-xl" as="p" delay={0.7}>
        {PITCH_TAGLINE}
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
