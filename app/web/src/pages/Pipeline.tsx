import { Check, ShieldCheck, XCircle } from 'lucide-react'
import { AGENTS } from '../components/agentMeta'
import { LiveOutput } from '../components/LiveOutput'
import { usePipeline } from '../context/PipelineContext'
import { AGENT_RULES } from '../lib/businessRules'
import type { PipelineStep, Verdict } from '../types'

const STAGE_ORDER = ['curator', 'planner', 'engagement', 'assessor', 'manager_insights', 'critic']

type AgentStatus = 'idle' | 'running' | 'done'

function stageStatus(agent: string, steps: PipelineStep[], verdicts: Verdict[]): AgentStatus {
  const related = steps.filter((s) => s.agent === agent)
  if (related.length === 0) return verdicts.length > 0 && agent === 'critic' ? 'done' : 'idle'
  if (related.some((s) => s.status === 'running')) return 'running'
  return 'done'
}

function StatusBadge({ state }: { state: AgentStatus }) {
  if (state === 'running')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
        <span className="size-1.5 rounded-full bg-indigo-400 cp-blink" /> Running
      </span>
    )
  if (state === 'done')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
        <Check className="size-3" /> Done
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      <span className="size-1.5 rounded-full bg-slate-600" /> Pending
    </span>
  )
}

function AgentCard({
  agentId,
  state,
  index,
}: {
  agentId: string
  state: AgentStatus
  index: number
}) {
  const meta = AGENTS[agentId]
  const Icon = meta.icon
  const rules = AGENT_RULES[agentId] ?? []
  const isRunning = state === 'running'
  const isDone = state === 'done'

  return (
    <div
      className={`cp-fade-up relative flex items-start gap-4 rounded-3xl border bg-white/[0.03] p-4 transition-all ${
        isRunning ? 'border-indigo-400/50 cp-breathe' : isDone ? 'border-emerald-400/40' : 'border-white/[0.08]'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className={`relative grid size-12 shrink-0 place-items-center rounded-2xl border ${meta.bg} ${meta.border} ${isRunning ? 'ring-4 ring-indigo-400/20' : ''}`}
      >
        <Icon className={`size-5 ${meta.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-sm font-bold text-white">{meta.label}</h3>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{meta.description}</p>
        {rules.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {rules.map((r) => (
              <span
                key={r}
                className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[10px] text-indigo-300 ring-1 ring-indigo-400/20"
              >
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
      <StatusBadge state={state} />
    </div>
  )
}

function GateCard({ verdicts, running }: { verdicts: Verdict[]; running: boolean }) {
  const approved = verdicts.some((v) => v.verdict === 'approve')
  const revising = verdicts.some((v) => v.verdict === 'revise')
  const gateRunning = running && !approved && !revising && verdicts.length === 0

  let label = 'Waiting'
  let cls = 'bg-white/[0.04] text-slate-400'
  if (gateRunning) {
    label = 'Reviewing…'
    cls = 'bg-cyan-500/15 text-cyan-300 cp-blink'
  } else if (approved) {
    label = 'Approved'
    cls = 'bg-emerald-500/15 text-emerald-300'
  } else if (revising) {
    label = 'Revision'
    cls = 'bg-amber-500/15 text-amber-300'
  }

  return (
    <div className="flex items-center gap-3 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-300">
        <ShieldCheck className="size-5" />
      </span>
      <div className="flex-1">
        <p className="font-heading text-sm font-bold text-white">Critic approval gate</p>
        <p className="text-xs text-slate-400">Reviews the full transcript against BR-001–BR-005 before release.</p>
      </div>
      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${cls}`}>
        {approved && <Check className="mr-1 inline size-3.5" />}
        {label}
      </span>
    </div>
  )
}

export default function Pipeline() {
  const { selectedLearner, running, steps, verdicts, error, run } = usePipeline()

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-600 p-6 text-white md:p-8">
        <div className="relative z-10 max-w-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
            6 agents · 1 critic gate
          </span>
          <h2 className="mt-3 font-heading text-2xl font-extrabold leading-tight md:text-3xl">
            Certification, on autopilot
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
            SkillPilot runs a team of reasoning agents for{' '}
            <span className="font-semibold">{selectedLearner?.learner_id ?? 'your learner'}</span> — grounded in your
            knowledge base and governed by explicit business rules.
          </p>
          <button
            onClick={run}
            disabled={running}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm transition hover:brightness-95 disabled:opacity-70"
          >
            {running ? 'Running…' : 'Run the pipeline'}
          </button>
        </div>
        <img
          src="/images/hero-study.png"
          alt=""
          className="pointer-events-none absolute -bottom-4 right-2 hidden h-[112%] w-auto object-contain md:block"
        />
        <div className="pointer-events-none absolute -right-10 top-1/2 hidden size-72 -translate-y-1/2 rounded-full bg-white/10 blur-2xl md:block" />
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <XCircle size={18} /> {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-3">
          {STAGE_ORDER.map((agentId, i) => (
            <div key={agentId} className="relative">
              <AgentCard
                agentId={agentId}
                state={stageStatus(agentId, steps, verdicts)}
                index={i}
              />
              {i < STAGE_ORDER.length - 1 && (
                <div className="ml-[2.4rem] h-3 w-0.5 bg-gradient-to-b from-white/[0.1] to-transparent" />
              )}
            </div>
          ))}
          <GateCard verdicts={verdicts} running={running} />
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <LiveOutput steps={steps} verdicts={verdicts} running={running} />
        </div>
      </div>
    </div>
  )
}
