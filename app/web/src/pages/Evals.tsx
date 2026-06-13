import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  BadgeCheck,
  CircleCheck,
  CircleX,
  FlaskConical,
  History,
  Quote,
  RefreshCcw,
  Scale,
  Target,
} from 'lucide-react'
import { fetchEvals } from '../api'
import type { EvalRun } from '../types'
import { AGENTS } from '../components/agentMeta'

function ScoreBadge({ value }: { value: number | null }) {
  if (value == null) return <span className="text-slate-600">—</span>
  const tone =
    value >= 4
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25'
      : value >= 3
        ? 'bg-amber-500/15 text-amber-300 border-amber-400/25'
        : 'bg-rose-500/15 text-rose-300 border-rose-400/25'
  return <span className={`chip border ${tone}`}>{value}/5</span>
}

export default function Evals() {
  const [runs, setRuns] = useState<EvalRun[]>([])
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    fetchEvals().then((data) => {
      setRuns(data)
      setSelected(Math.max(0, data.length - 1))
    })
  }, [])

  const run = runs[selected]
  const passRate = run
    ? Math.round(
        (run.results.filter(
          (r) =>
            r.citation_coverage &&
            Object.values(r.deterministic).every((d) => d.passed) &&
            Math.min(r.groundedness ?? 0, r.rule_compliance ?? 0) >= 3,
        ).length /
          run.results.length) *
          100,
      )
    : 0

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white">
            <Activity size={22} className="text-indigo-400" />
            Self-Evaluation Loop
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Every run scores the live agents on groundedness, adherence, rule compliance and citations — and
            self-corrects on failure.
          </p>
        </div>
        {runs.length > 1 && (
          <div className="flex items-center gap-2">
            <History size={14} className="text-slate-500" />
            <select
              value={selected}
              onChange={(e) => setSelected(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-ink-850 px-3 py-1.5 text-[12px] text-slate-300 focus:outline-none"
            >
              {runs.map((r, i) => (
                <option key={i} value={i}>
                  Run {i + 1} — {new Date(r.timestamp).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {run && (
        <>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Scenario cases', value: String(run.results.length), icon: FlaskConical, color: 'text-indigo-300' },
              { label: 'Pass rate', value: `${passRate}%`, icon: BadgeCheck, color: 'text-emerald-300' },
              {
                label: 'Avg groundedness',
                value: (
                  run.results.reduce((acc, r) => acc + (r.groundedness ?? 0), 0) / run.results.length
                ).toFixed(1),
                icon: Quote,
                color: 'text-cyan-300',
              },
              {
                label: 'Avg rule compliance',
                value: (
                  run.results.reduce((acc, r) => acc + (r.rule_compliance ?? 0), 0) / run.results.length
                ).toFixed(1),
                icon: Scale,
                color: 'text-fuchsia-300',
              },
            ].map(({ label, value, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass p-4"
              >
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  <Icon size={13} className={color} /> {label}
                </div>
                <div className="mt-1.5 text-2xl font-bold text-white">{value}</div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            {run.results.map((result, i) => {
              const meta = AGENTS[result.agent]
              const Icon = meta?.icon ?? Target
              return (
                <motion.article
                  key={result.case_id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="glass glass-hover p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${meta?.bg ?? 'bg-white/5'} ${meta?.border ?? 'border-white/10'}`}>
                        <Icon size={16} className={meta?.color ?? 'text-slate-300'} />
                      </div>
                      <div>
                        <div className="font-mono text-[13px] font-semibold text-white">{result.case_id}</div>
                        <div className="text-[11px] text-slate-500">{meta?.label ?? result.agent}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.self_corrected && (
                        <span className="chip border border-cyan-400/25 bg-cyan-500/15 text-cyan-300">
                          <RefreshCcw size={10} /> self-corrected
                        </span>
                      )}
                      {result.citation_coverage ? (
                        <span className="chip border border-emerald-400/25 bg-emerald-500/15 text-emerald-300">
                          <CircleCheck size={11} /> citations
                        </span>
                      ) : (
                        <span className="chip border border-rose-400/25 bg-rose-500/15 text-rose-300">
                          <CircleX size={11} /> citations
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {(
                      [
                        ['Groundedness', result.groundedness],
                        ['Task adherence', result.task_adherence],
                        ['Rule compliance', result.rule_compliance],
                      ] as const
                    ).map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                        <span className="text-[12px] text-slate-400">{label}</span>
                        <ScoreBadge value={value} />
                      </div>
                    ))}
                  </div>

                  {Object.entries(result.deterministic).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(result.deterministic).map(([name, check]) => (
                        <span
                          key={name}
                          title={check.detail}
                          className={`chip border ${
                            check.passed
                              ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
                              : 'border-rose-400/25 bg-rose-500/10 text-rose-300'
                          }`}
                        >
                          {check.passed ? <CircleCheck size={10} /> : <CircleX size={10} />}
                          {name} · deterministic
                        </span>
                      ))}
                    </div>
                  )}

                  {result.rationale && (
                    <p className="mt-3 border-l-2 border-white/10 pl-3 text-[12px] italic leading-relaxed text-slate-500">
                      {result.rationale}
                    </p>
                  )}
                </motion.article>
              )
            })}
          </div>
        </>
      )}

      {runs.length === 0 && (
        <div className="glass flex flex-col items-center gap-2 p-12 text-slate-500">
          <FlaskConical size={28} strokeWidth={1.5} />
          <div className="text-sm">No evaluation runs yet — run `python -m certpilot.evals` first.</div>
        </div>
      )}
    </div>
  )
}
