import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  GraduationCap,
  LifeBuoy,
  MessagesSquare,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react'
import { PRODUCT_NAME, TAGLINE_SHORT } from './branding'
import { AmbientBackground } from './components/AmbientBackground'
import { Topbar } from './components/Topbar'
import { PipelineProvider, usePipeline } from './context/PipelineContext'
import Pipeline from './pages/Pipeline'
import AgentsChat from './pages/AgentsChat'
import Teams from './pages/Teams'
import Evals from './pages/Evals'

const NAV = [
  { id: 'pipeline', label: 'Agent Pipeline', icon: Workflow },
  { id: 'chat', label: 'Agent Chat', icon: MessagesSquare, badge: 'AI' },
  { id: 'teams', label: 'Team Insights', icon: Users },
  { id: 'evals', label: 'Evaluations', icon: Activity },
] as const

type PageId = (typeof NAV)[number]['id']

function AppShell() {
  const [page, setPage] = useState<PageId>('pipeline')
  const { selectedLearner, running, run } = usePipeline()

  const handleRun = () => {
    setPage('pipeline')
    run()
  }

  return (
    <div className="app-shell relative flex h-dvh overflow-hidden">
      <AmbientBackground />

      <aside className="theme-sidebar z-10 flex w-[248px] shrink-0 flex-col gap-5 border-r p-5 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-1">
          <div className="grid size-10 place-items-center rounded-sm bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap className="size-5" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <p className="theme-heading font-heading text-base font-extrabold">{PRODUCT_NAME}</p>
            <p className="theme-muted text-[11px]">{TAGLINE_SHORT}</p>
          </div>
        </div>

        {selectedLearner && (
          <div className="theme-surface flex items-center gap-3 rounded-md border p-3">
            <img
              src="/images/avatar-ana.png"
              alt="Active learner"
              className="size-12 rounded-sm object-cover"
            />
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] text-slate-500">Active learner</p>
              <p className="truncate font-heading text-sm font-bold text-white">{selectedLearner.learner_id}</p>
              <p className="truncate text-[11px] text-slate-500">
                {selectedLearner.certification_target} · {selectedLearner.team}
              </p>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-1">
          <p className="theme-muted px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em]">Workspace</p>
          {NAV.map((item) => {
            const isActive = page === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPage(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`theme-nav group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'theme-nav-active font-semibold' : ''
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-gradient-to-b from-indigo-400 to-cyan-400"
                  />
                )}
                <Icon className="size-[18px] shrink-0" />
                <span>{item.label}</span>
                {'badge' in item && item.badge && (
                  <span className="ml-auto rounded-sm bg-indigo-500/25 px-2 py-0.5 text-[10px] font-semibold text-indigo-200">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="theme-surface mt-auto rounded-md border bg-gradient-to-b p-4">
          <div className="flex items-center justify-between">
            <span className="theme-muted text-[11px] font-semibold uppercase tracking-wide">
              {running ? 'Running' : 'Idle'}
            </span>
            <span className={`size-2 rounded-full ${running ? 'bg-emerald-400 cp-blink' : 'bg-slate-600'}`} />
          </div>
          <p className="theme-heading mt-1 font-heading text-sm font-bold">Live pipeline</p>
          <div className="mt-3 flex h-10 items-end gap-1" aria-hidden>
            {Array.from({ length: 10 }, (_, i) => (
              <span
                key={i}
                className="w-1.5 flex-1 rounded-sm bg-indigo-400/70"
                style={{
                  height: running ? '100%' : '30%',
                  animation: running ? `cp-equalizer ${0.7 + (i % 4) * 0.18}s ease-in-out ${i * 0.05}s infinite` : 'none',
                  minHeight: 6,
                }}
              />
            ))}
          </div>
          <p className="theme-muted mt-3 text-[11px]">Critic gate guarding BR-001–BR-005</p>
        </div>

        <div className="theme-divider border-t pt-4">
          <div className="theme-muted flex items-center gap-2 px-1 text-[11px] font-medium">
            <ShieldCheck size={13} className="text-emerald-400" />
            Grounded in Foundry IQ
          </div>
          <div className="theme-muted mt-1 px-1 text-[10.5px] opacity-80">Microsoft Agents League 2026</div>
          <div className="theme-muted mt-3 flex items-center justify-between px-1">
            <button className="theme-nav-hover flex items-center gap-2 text-xs transition-colors">
              <Settings className="size-4" /> Settings
            </button>
            <button className="theme-nav-hover flex items-center gap-2 text-xs transition-colors">
              <LifeBuoy className="size-4" /> Help
            </button>
          </div>
        </div>
      </aside>

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar view={page} onRun={handleRun} />

        <div className="cp-scroll flex-1 overflow-y-auto px-6 pb-8 pt-2 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {page === 'pipeline' && <Pipeline />}
              {page === 'chat' && <AgentsChat />}
              {page === 'teams' && <Teams />}
              {page === 'evals' && <Evals />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <PipelineProvider>
      <AppShell />
    </PipelineProvider>
  )
}
