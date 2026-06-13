import { useEffect, useRef, useState } from 'react'
import { Check, ListChecks, Quote, Terminal } from 'lucide-react'
import { AGENTS } from './agentMeta'
import { BUSINESS_RULES, CITATIONS } from '../lib/businessRules'
import type { PipelineStep, Verdict } from '../types'

type LogLine = { kind: string; text: string; cites?: number[] }

type Tab = 'log' | 'cites' | 'rules'

const LOG_COLOR: Record<string, string> = {
  system: 'text-slate-500 border-white/[0.08]',
  agent: 'text-indigo-300 border-indigo-400/40',
  critic: 'text-cyan-300 border-cyan-400/50',
  success: 'text-emerald-300 border-emerald-400/60 font-medium',
  error: 'text-rose-300 border-rose-400/50',
  revise: 'text-amber-300 border-amber-400/50',
}

function buildLogs(steps: PipelineStep[], verdicts: Verdict[]): LogLine[] {
  const lines: LogLine[] = []
  if (steps.length === 0 && verdicts.length === 0) return lines

  lines.push({ kind: 'system', text: 'SkillPilot pipeline stream started' })

  for (const step of steps) {
    if (step.status === 'running') {
      lines.push({ kind: 'agent', text: `[${AGENTS[step.agent]?.label ?? step.agent}] ${step.label} — reasoning…` })
    } else if (step.status === 'done' && step.text) {
      const preview = step.text.length > 120 ? `${step.text.slice(0, 120)}…` : step.text
      lines.push({
        kind: 'agent',
        text: `[${AGENTS[step.agent]?.label ?? step.agent}] ${step.revision ? '(revision) ' : ''}${preview}`,
      })
    }
  }

  for (const v of verdicts) {
    if (v.verdict === 'approve') {
      lines.push({ kind: 'success', text: `Critic APPROVED — round ${v.round}` })
    } else {
      lines.push({ kind: 'revise', text: `Critic REVISE requested — round ${v.round}: ${v.violations.join('; ')}` })
    }
  }

  return lines
}

function LogRow({ line }: { line: LogLine }) {
  return (
    <div className={`cp-line-in border-l-2 py-1 pl-3 font-mono text-[11.5px] leading-relaxed ${LOG_COLOR[line.kind] ?? LOG_COLOR.agent}`}>
      {line.text}
    </div>
  )
}

export function LiveOutput({
  steps,
  verdicts,
  running,
}: {
  steps: PipelineStep[]
  verdicts: Verdict[]
  running: boolean
}) {
  const [tab, setTab] = useState<Tab>('log')
  const bodyRef = useRef<HTMLDivElement>(null)
  const logs = buildLogs(steps, verdicts)

  useEffect(() => {
    if (tab === 'log' && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [logs, tab])

  const tabs: { id: Tab; label: string; icon: typeof Terminal }[] = [
    { id: 'log', label: 'Transcript', icon: Terminal },
    { id: 'cites', label: 'Citations', icon: Quote },
    { id: 'rules', label: 'BR checks', icon: ListChecks },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className={`size-2 rounded-full ${running ? 'bg-emerald-400 cp-blink' : 'bg-indigo-400'}`} />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live output</span>
        <div className="ml-auto flex gap-1">
          {tabs.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-medium transition ${
                  tab === t.id ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-500 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="size-3.5" />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div ref={bodyRef} className="cp-scroll min-h-[360px] flex-1 overflow-y-auto p-4">
        {tab === 'log' && (
          <div className="flex flex-col gap-0.5">
            {logs.length === 0 ? (
              <p className="font-mono text-[11.5px] text-slate-600">
                {'// select a learner and run the pipeline to begin'}
              </p>
            ) : (
              logs.map((l, i) => <LogRow key={i} line={l} />)
            )}
            {running && (
              <div className="mt-1 flex items-center gap-1 pl-3">
                <span className="size-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.2s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.1s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-indigo-400" />
              </div>
            )}
          </div>
        )}

        {tab === 'cites' && (
          <ul className="flex flex-col gap-2.5">
            {CITATIONS.map((c) => (
              <li key={c.ref} className="rounded-sm border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-500/15 px-1.5 py-px font-mono text-[10px] text-indigo-300 ring-1 ring-indigo-400/25">
                    ref:{c.ref}
                  </span>
                  <span className="text-sm font-semibold text-white">{c.title}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{c.desc}</p>
              </li>
            ))}
          </ul>
        )}

        {tab === 'rules' && (
          <ul className="flex flex-col gap-2">
            {BUSINESS_RULES.map((r) => (
              <li key={r.id} className="flex items-start gap-3 rounded-sm border border-white/[0.06] bg-white/[0.02] p-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm bg-emerald-500/15 text-emerald-300">
                  <Check className="size-3" />
                </span>
                <div>
                  <span className="font-mono text-xs font-semibold text-indigo-300">{r.id}</span>
                  <p className="text-xs text-slate-400">{r.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
