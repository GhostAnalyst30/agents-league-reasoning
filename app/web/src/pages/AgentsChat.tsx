import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MessagesSquare, SendHorizonal, User } from 'lucide-react'
import { sendChat } from '../api'
import { AGENTS } from '../components/agentMeta'
import Markdown from '../components/Markdown'

interface Message {
  role: 'user' | 'agent'
  agent?: string
  text: string
}

const SUGGESTIONS: Record<string, string> = {
  curator: 'Learner L-1001 wants to prepare for their target certification. Propose the learning path.',
  planner: 'Create a weekly study plan for learner L-1004 respecting their study capacity.',
  engagement: 'Propose a reminder schedule for learner L-1005 aligned to their work patterns.',
  assessor: 'Evaluate exam readiness for learner L-1001 and generate two practice questions.',
  manager_insights: 'Give the manager of TEAM-A a readiness summary with recommended actions.',
  critic: 'What rules do you validate before an answer reaches a learner?',
}

export default function AgentsChat() {
  const [agent, setAgent] = useState('curator')
  const [input, setInput] = useState(SUGGESTIONS.curator)
  const [messages, setMessages] = useState<Message[]>([])
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setBusy(true)
    try {
      const res = await sendChat(agent, text)
      setMessages((m) => [...m, { role: 'agent', agent, text: res.text }])
    } catch {
      setMessages((m) => [...m, { role: 'agent', agent, text: 'The agent did not respond. Try again.' }])
    } finally {
      setBusy(false)
    }
  }

  const meta = AGENTS[agent]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white">
          <MessagesSquare size={22} className="text-indigo-400" />
          Talk to the Specialists
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Each agent has its own tools, rules and grounding. Pick one and put it to work.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {Object.entries(AGENTS).map(([key, info]) => {
          const Icon = info.icon
          const active = key === agent
          return (
            <button
              key={key}
              onClick={() => {
                setAgent(key)
                setInput(SUGGESTIONS[key])
              }}
              className={`glass glass-hover p-4 text-left ${active ? `border ${info.border} ${info.bg}` : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${info.bg} ${info.border}`}>
                  <Icon size={16} className={info.color} />
                </div>
                <span className="text-[13px] font-semibold text-white">{info.label}</span>
              </div>
              <p className="mt-2 text-[11.5px] leading-snug text-slate-400">{info.description}</p>
            </button>
          )
        })}
      </div>

      <section className="glass flex h-[480px] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-600">
              <meta.icon size={32} strokeWidth={1.5} />
              <div className="text-[13px]">Send a message to {meta.label}</div>
            </div>
          )}
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}
              >
                {m.role === 'agent' && m.agent && (
                  <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${AGENTS[m.agent].bg} ${AGENTS[m.agent].border}`}>
                    {(() => {
                      const Icon = AGENTS[m.agent].icon
                      return <Icon size={14} className={AGENTS[m.agent].color} />
                    })()}
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500/90 to-indigo-600/90 text-[13.5px] text-white'
                      : 'border border-white/[0.07] bg-white/[0.03]'
                  }`}
                >
                  {m.role === 'user' ? m.text : <Markdown text={m.text} />}
                </div>
                {m.role === 'user' && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                    <User size={14} className="text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {busy && (
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <Loader2 size={14} className="animate-spin text-indigo-400" />
              {meta.label} is reasoning — calling tools and retrieving grounded knowledge…
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={`Message ${meta.label}…`}
              className="flex-1 rounded-xl border border-white/[0.08] bg-ink-850/80 px-4 py-2.5 text-[13px] text-white placeholder:text-slate-600 focus:border-indigo-400/50 focus:outline-none"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 disabled:opacity-40"
            >
              <SendHorizonal size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
