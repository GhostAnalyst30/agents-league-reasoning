import { useEffect, useState } from 'react'
import { Check, CircleCheck, CircleX, FlaskConical, History, RefreshCcw } from 'lucide-react'
import { CircularScore } from '../components/CircularScore'
import { fetchEvals } from '../api'
import type { EvalRun } from '../types'
import { AGENTS } from '../components/agentMeta'

function ScoreChip({ value }: { value: number | null }) {
  if (value == null) return <span className="text-slate-600">—</span>
  const normalized = value / 5
  const cls =
    normalized >= 0.85
      ? 'bg-emerald-500/12 text-emerald-300'
      : normalized >= 0.7
        ? 'bg-amber-500/15 text-amber-300'
        : 'bg-rose-500/12 text-rose-300'
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${cls}`}>
      {normalized.toFixed(2)}
    </span>
  )
}

function isPass(r: EvalRun['results'][number]) {
  return (
    r.citation_coverage &&
    Object.values(r.deterministic).every((d) => d.passed) &&
    Math.min(r.groundedness ?? 0, r.rule_compliance ?? 0) >= 3
  )
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
    ? run.results.filter(isPass).length / run.results.length
    : 0
  const avgGrounded = run
    ? run.results.reduce((acc, r) => acc + (r.groundedness ?? 0), 0) / run.results.length / 5
    : 0
  const avgRules = run
    ? run.results.reduce((acc, r) => acc + (r.rule_compliance ?? 0), 0) / run.results.length / 5
    : 0
  const avgCitations = run
    ? run.results.filter((r) => r.citation_coverage).length / run.results.length
    : 0

  const scoreRings = run
    ? [
        { label: 'Pass rate', val: passRate, color: '#6366f1' },
        { label: 'Groundedness', val: avgGrounded, color: '#38bdf8' },
        { label: 'Rule compliance', val: avgRules, color: '#34d399' },
        { label: 'Citation coverage', val: avgCitations, color: '#fbbf24' },
      ]
    : []

  return (
    <div className="flex flex-col gap-5">
      {runs.length > 1 && (
        <div className="flex items-center justify-end gap-2">
          <History size={14} className="text-slate-500" />
          <select
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
            className="rounded-full border border-white/[0.08] bg-ink-850 px-4 py-2 text-[12px] text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/15"
          >
            {runs.map((r, i) => (
              <option key={i} value={i}>
                Run {i + 1} — {new Date(r.timestamp).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      )}

      {run && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {scoreRings.map((s, i) => (
              <div
                key={s.label}
                className="cp-fade-up flex flex-col items-center gap-3 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <CircularScore value={s.val} color={s.color} />
                <span className="text-sm font-medium text-slate-400">{s.label}</span>
              </div>
            ))}
          </div>

          <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03]">
            <div className="border-b border-white/[0.06] px-5 py-4">
              <h3 className="font-heading text-sm font-bold text-white">Evaluation scenarios</h3>
              <p className="text-xs text-slate-400">Per-run quality scoring with auto-fix rounds</p>
            </div>
            <div className="cp-scroll overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-semibold">Scenario</th>
                    <th className="px-3 py-3 font-semibold">Agent</th>
                    <th className="px-3 py-3 font-semibold">Grounded</th>
                    <th className="px-3 py-3 font-semibold">Task</th>
                    <th className="px-3 py-3 font-semibold">Rules</th>
                    <th className="px-3 py-3 font-semibold">Citations</th>
                    <th className="px-3 py-3 font-semibold">Auto-fix</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {run.results.map((result) => {
                    const passed = isPass(result)
                    const meta = AGENTS[result.agent]
                    return (
                      <tr
                        key={result.case_id}
                        className="border-t border-white/[0.06] transition-colors hover:bg-indigo-500/5"
                      >
                        <td className="px-5 py-3 font-medium text-white">{result.case_id}</td>
                        <td className="px-3 py-3">
                          <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 font-mono text-xs text-indigo-300 ring-1 ring-indigo-400/20">
                            {meta?.label ?? result.agent}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <ScoreChip value={result.groundedness} />
                        </td>
                        <td className="px-3 py-3">
                          <ScoreChip value={result.task_adherence} />
                        </td>
                        <td className="px-3 py-3">
                          <ScoreChip value={result.rule_compliance} />
                        </td>
                        <td className="px-3 py-3">
                          {result.citation_coverage ? (
                            <CircleCheck className="size-4 text-emerald-400" />
                          ) : (
                            <CircleX className="size-4 text-rose-400" />
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`text-xs ${result.self_corrected ? 'font-medium text-amber-300' : 'text-slate-500'}`}
                          >
                            {result.self_corrected ? (
                              <span className="inline-flex items-center gap-1">
                                <RefreshCcw className="size-3" /> 1 round
                              </span>
                            ) : (
                              '—'
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                              passed ? 'bg-emerald-500/12 text-emerald-300' : 'bg-rose-500/12 text-rose-300'
                            }`}
                          >
                            <Check className="size-3" /> {passed ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {runs.length === 0 && (
        <div className="glass flex flex-col items-center gap-2 p-12 text-slate-500">
          <FlaskConical size={28} strokeWidth={1.5} />
          <div className="text-sm">No evaluation runs yet — run `python -m skillpilot_ai.evals` first.</div>
        </div>
      )}
    </div>
  )
}
