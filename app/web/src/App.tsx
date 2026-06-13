import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  GraduationCap,
  MessagesSquare,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react'
import Pipeline from './pages/Pipeline'
import AgentsChat from './pages/AgentsChat'
import Teams from './pages/Teams'
import Evals from './pages/Evals'

const NAV = [
  { id: 'pipeline', label: 'Pipeline', icon: Workflow, desc: 'End-to-end multi-agent run' },
  { id: 'chat', label: 'Agents', icon: MessagesSquare, desc: 'Chat with each specialist' },
  { id: 'teams', label: 'Team Insights', icon: Users, desc: 'Manager-level aggregates' },
  { id: 'evals', label: 'Evaluations', icon: Activity, desc: 'Self-evaluation loop' },
] as const

type PageId = (typeof NAV)[number]['id']

export default function App() {
  const [page, setPage] = useState<PageId>('pipeline')

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-white/[0.06] bg-ink-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25">
            <GraduationCap size={22} className="text-white" strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-tight text-white">CertPilot</div>
            <div className="text-[11px] font-medium text-slate-500">Reasoning Agents</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 pt-2">
          {NAV.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                page === id ? 'bg-indigo-500/15 text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              {page === id && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-gradient-to-b from-indigo-400 to-cyan-400"
                />
              )}
              <Icon size={18} strokeWidth={2} className={page === id ? 'text-indigo-300' : ''} />
              <div>
                <div className="text-[13px] font-semibold">{label}</div>
                <div className="text-[10.5px] text-slate-500">{desc}</div>
              </div>
            </button>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <ShieldCheck size={13} className="text-emerald-400" />
            Grounded in Foundry IQ
          </div>
          <div className="mt-1 text-[10.5px] text-slate-600">Microsoft Agents League 2026</div>
        </div>
      </aside>

      <main className="ml-64 flex-1 px-8 py-8">
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
      </main>
    </div>
  )
}
