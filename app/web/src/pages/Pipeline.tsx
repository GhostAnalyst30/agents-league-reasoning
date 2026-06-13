import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDashed,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react'
import { fetchLearners, streamFlow } from '../api'
import type { Learner, PipelineStep, Verdict } from '../types'
import { AGENTS } from '../components/agentMeta'
import Markdown from '../components/Markdown'

const STAGE_ORDER = ['curator', 'planner', 'engagement', 'assessor', 'manager_insights', 'critic']

export default function Pipeline() {
  const [learners, setLearners] = useState<Learner[]>([])
  const [selected, setSelected] = useState<string>('L-1001')
  const [running, setRunning] = useState(false)
  const [steps, setSteps] = useState<PipelineStep[]>([])
  const [verdicts, setVerdicts] = useState<Verdict[]>([])
  const [error, setError] = useState<string>('')
  const feedEnd = useRef<HTMLDivElement>(null)
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    fetchLearners().then(setLearners)
    return () => stopRef.current?.()
  }, [])

  useEffect(() => {
    feedEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [steps, verdicts])

  const stageStatus = (agent: string): 'idle' | 'running' | 'done' => {
    const related = steps.filter((s) => s.agent === agent)
    if (related.length === 0) return verdicts.length > 0 && agent === 'critic' ? 'done' : 'idle'
    if (related.some((s) => s.status === 'running')) return 'running'
    return 'done'
  }

  const run = () => {
    setSteps([])
    setVerdicts([])
    setError('')
    setRunning(true)
    stopRef.current = streamFlow(selected, {
      onStepStart: (d) =>
        setSteps((prev) => [
          ...prev,
          { agent: d.agent, label: d.label, status: 'running', prompt: d.prompt, revision: d.revision, round: d.round },
        ]),
      onStepDone: (d) =>
        setSteps((prev) => {
          const next = [...prev]
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].agent === d.agent && next[i].status === 'running') {
              next[i] = { ...next[i], status: 'done', text: d.text }
              break
            }
          }
          return next
        }),
      onVerdict: (d) => {
        setVerdicts((prev) => [...prev, d])
        setSteps((prev) =>
          prev.map((s) => (s.agent === 'critic' && s.status === 'running' ? { ...s, status: 'done' } : s)),
        )
      },
      onDone: () => setRunning(false),
      onError: (m) => {
        setError(m)
        setRunning(false)
      },
    })
  }

  const learner = learners.find((l) => l.learner_id === selected)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white">
          <Sparkles size={22} className="text-indigo-400" />
          Multi-Agent Pipeline
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Six specialized agents take a learner from intent to exam-ready — grounded in Foundry IQ, gated by a critic.
        </p>
      </header>

      {/* Learner selector */}
      <section className="glass p-5">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Select a learner</div>
        <div className="grid grid-cols-4 gap-3">
          {learners.map((l) => {
            const active = l.learner_id === selected
            const threshold = l.certification.pass_threshold_practice ?? 75
            const behind = l.practice_score_avg < threshold
            return (
              <button
                key={l.learner_id}
                disabled={running}
                onClick={() => setSelected(l.learner_id)}
                className={`glass-hover rounded-xl border p-3 text-left transition-all ${
                  active ? 'border-indigo-400/50 bg-indigo-500/10' : 'border-white/[0.07] bg-white/[0.02]'
                } ${running ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] font-semibold text-white">{l.learner_id}</span>
                  <span className={`chip ${behind ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                    {l.practice_score_avg}%
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                  <Briefcase size={11} /> {l.role}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                  <Target size={11} /> {l.certification_target}
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${behind ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-emerald-500 to-cyan-400'}`}
                    style={{ width: `${Math.min(100, (l.practice_score_avg / threshold) * 100)}%` }}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {learner && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-ink-850/60 px-4 py-3">
            <div className="flex items-center gap-5 text-[12px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Target size={13} className="text-indigo-400" />
                {learner.certification.name ?? learner.certification_target}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarClock size={13} className="text-cyan-400" />
                {learner.max_weekly_study_hours}h/week capacity
              </span>
              {(learner.signals.meeting_hours_per_week ?? 0) > 20 && (
                <span className="chip bg-amber-500/15 text-amber-300">
                  <AlertTriangle size={11} /> capacity constrained
                </span>
              )}
            </div>
            <button
              onClick={run}
              disabled={running}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2 text-[13px] font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 disabled:opacity-60"
            >
              {running ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              {running ? 'Running pipeline…' : 'Run pipeline'}
            </button>
          </div>
        )}
      </section>

      {/* Stage tracker */}
      <section className="glass p-5">
        <div className="flex items-center justify-between">
          {STAGE_ORDER.map((agent, i) => {
            const meta = AGENTS[agent]
            const status = stageStatus(agent)
            const Icon = meta.icon
            return (
              <div key={agent} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-500 ${
                      status === 'done'
                        ? `${meta.bg} ${meta.border}`
                        : status === 'running'
                          ? `${meta.bg} ${meta.border} animate-pulse-ring`
                          : 'border-white/[0.07] bg-white/[0.02]'
                    }`}
                  >
                    {status === 'running' ? (
                      <Loader2 size={18} className={`animate-spin ${meta.color}`} />
                    ) : status === 'done' ? (
                      <Icon size={18} className={meta.color} />
                    ) : (
                      <Icon size={18} className="text-slate-600" />
                    )}
                    {status === 'done' && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
                        <Check size={10} strokeWidth={3} className="text-white" />
                      </span>
                    )}
                  </div>
                  <span className={`max-w-[90px] text-center text-[10px] font-medium leading-tight ${status === 'idle' ? 'text-slate-600' : 'text-slate-300'}`}>
                    {meta.label}
                  </span>
                </div>
                {i < STAGE_ORDER.length - 1 && (
                  <div className="mx-1 mb-5 h-px flex-1 overflow-hidden rounded bg-white/[0.07]">
                    <div
                      className={`h-full bg-gradient-to-r from-indigo-400 to-cyan-400 transition-all duration-700 ${status === 'done' ? 'w-full' : 'w-0'}`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="glass flex items-center gap-3 border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <XCircle size={18} /> {error}
        </div>
      )}

      {/* Message feed */}
      <section className="space-y-4">
        <AnimatePresence>
          {steps.map((step, idx) => {
            const meta = AGENTS[step.agent]
            const Icon = meta.icon
            return (
              <motion.article
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className={`glass overflow-hidden ${step.revision ? 'border-amber-400/25' : ''}`}
              >
                <header className={`flex items-center gap-3 border-b border-white/[0.06] px-5 py-3 ${step.revision ? 'bg-amber-500/[0.06]' : 'bg-white/[0.02]'}`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${meta.bg} ${meta.border}`}>
                    {step.revision ? <RotateCcw size={15} className="text-amber-300" /> : <Icon size={15} className={meta.color} />}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-white">
                      {step.revision ? 'Revision — Learning Path Curator' : meta.label}
                      {step.round ? <span className="ml-2 text-[11px] font-medium text-slate-500">round {step.round}</span> : null}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <ChevronRight size={11} /> {step.prompt}
                    </div>
                  </div>
                  {step.status === 'running' ? (
                    <span className="chip bg-indigo-500/15 text-indigo-300">
                      <Loader2 size={11} className="animate-spin" /> reasoning
                    </span>
                  ) : (
                    <span className="chip bg-emerald-500/15 text-emerald-300">
                      <BadgeCheck size={11} /> complete
                    </span>
                  )}
                </header>
                <div className="px-5 py-4">
                  {step.status === 'running' ? (
                    <div className="space-y-2.5">
                      {[92, 78, 64].map((w) => (
                        <div
                          key={w}
                          style={{ width: `${w}%` }}
                          className="h-3.5 animate-shimmer rounded bg-gradient-to-r from-white/[0.04] via-white/[0.1] to-white/[0.04] bg-[length:200%_100%]"
                        />
                      ))}
                    </div>
                  ) : step.text ? (
                    <Markdown text={step.text} />
                  ) : (
                    <div className="flex items-center gap-2 text-[12px] text-slate-500">
                      <CircleDashed size={13} /> validating transcript…
                    </div>
                  )}
                </div>
              </motion.article>
            )
          })}
        </AnimatePresence>

        {/* Verdicts */}
        <AnimatePresence>
          {verdicts.map((v, i) => (
            <motion.article
              key={`verdict-${i}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className={`glass border-2 p-5 ${
                v.verdict === 'approve' ? 'border-emerald-400/40 bg-emerald-500/[0.06]' : 'border-amber-400/40 bg-amber-500/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                {v.verdict === 'approve' ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                    <BadgeCheck size={20} className="text-emerald-300" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                    <AlertTriangle size={20} className="text-amber-300" />
                  </div>
                )}
                <div>
                  <div className="text-[15px] font-bold text-white">
                    {v.verdict === 'approve' ? 'Approved by the Critic' : 'Revision requested'}
                    <span className="ml-2 text-[11px] font-medium text-slate-500">round {v.round}</span>
                  </div>
                  <div className="text-[12px] text-slate-400">
                    {v.verdict === 'approve'
                      ? 'Every business rule check passed — the output is released to the learner.'
                      : 'The transcript violates one or more business rules and goes back for correction.'}
                  </div>
                </div>
              </div>
              {v.violations.length > 0 && (
                <ul className="mt-3 space-y-1.5 pl-1">
                  {v.violations.map((violation, j) => (
                    <li key={j} className="flex items-start gap-2 text-[12.5px] text-amber-200/90">
                      <XCircle size={14} className="mt-0.5 shrink-0 text-amber-400" />
                      {String(violation)}
                    </li>
                  ))}
                </ul>
              )}
            </motion.article>
          ))}
        </AnimatePresence>
        <div ref={feedEnd} />
      </section>
    </div>
  )
}
