import { ChevronDown, Play } from 'lucide-react'
import { ThemeMenu } from './ThemeMenu'
import { usePipeline } from '../context/PipelineContext'

const TITLES: Record<string, { title: string; sub: string }> = {
  pipeline: { title: 'Agent Pipeline', sub: 'Watch the reasoning agents work, step by step' },
  chat: { title: 'Agent Chat', sub: 'Ask the team about readiness, plans and practice' },
  teams: { title: 'Team Insights', sub: 'Aggregate readiness across your organisation' },
  evals: { title: 'Evaluations', sub: 'Quality scores for every agent run' },
}

export function Topbar({ view, onRun }: { view: string; onRun?: () => void }) {
  const { learners, selectedId, setSelectedId, running, run } = usePipeline()
  const meta = TITLES[view] ?? TITLES.pipeline
  const handleRun = onRun ?? run

  return (
    <header className="flex flex-wrap items-center gap-4 px-6 pb-2 pt-6 md:px-8">
      <div className="min-w-0">
        <h1 className="theme-heading font-heading text-2xl font-extrabold tracking-tight md:text-3xl">
          {meta.title}
        </h1>
        <p className="theme-muted text-sm">{meta.sub}</p>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={running}
            aria-label="Select learner"
            className="theme-input h-10 cursor-pointer appearance-none rounded-sm border pl-4 pr-9 text-sm font-medium outline-none transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {learners.map((l) => (
              <option key={l.learner_id} value={l.learner_id}>
                {l.learner_id} — {l.role}
              </option>
            ))}
          </select>
          <ChevronDown className="theme-muted pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" />
        </div>

        <ThemeMenu />

        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className="inline-flex h-10 items-center gap-2 rounded-sm bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {running ? (
            <span className="cp-spin size-4 rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Play className="size-4 fill-current" />
          )}
          {running ? 'Running…' : 'Run Pipeline'}
        </button>
      </div>
    </header>
  )
}
