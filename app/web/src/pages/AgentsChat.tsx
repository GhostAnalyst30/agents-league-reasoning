import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Loader2, Sparkles } from 'lucide-react'
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

const QUICK_PROMPTS = [
  'Am I ready for the exam?',
  'Show my study plan',
  "What's the practice set mix?",
]

export default function AgentsChat() {
  const [agent, setAgent] = useState('curator')
  const [input, setInput] = useState(SUGGESTIONS.curator)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      agent: 'curator',
      text: "Hi! I'm SkillPilot. Ask me anything about certification readiness, study plans or practice questions.",
    },
  ])
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || busy) return
    setMessages((m) => [...m, { role: 'user', text: msg }])
    setInput('')
    setBusy(true)
    try {
      const res = await sendChat(agent, msg)
      setMessages((m) => [...m, { role: 'agent', agent, text: res.text }])
    } catch {
      setMessages((m) => [...m, { role: 'agent', agent, text: 'The agent did not respond. Try again.' }])
    } finally {
      setBusy(false)
    }
  }

  const meta = AGENTS[agent]

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="grid grid-cols-3 gap-2">
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
              className={`rounded-sm border p-3 text-left transition-all ${
                active
                  ? `${info.border} ${info.bg} border`
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`grid size-8 place-items-center rounded-sm border ${info.bg} ${info.border}`}>
                  <Icon size={14} className={info.color} />
                </div>
                <span className="text-[12px] font-semibold text-white">{info.label.split(' ')[0]}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex h-[calc(100vh-280px)] min-h-[400px] flex-col">
        <div ref={scrollRef} className="cp-scroll flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`cp-fade-up flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`grid size-9 shrink-0 place-items-center rounded-sm ${
                  m.role === 'agent'
                    ? 'bg-indigo-500/12 text-indigo-300'
                    : 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'
                }`}
              >
                {m.role === 'agent' ? (
                  <Sparkles className="size-4" />
                ) : (
                  <span className="text-xs font-bold">U</span>
                )}
              </div>
              <div className={`max-w-[80%] ${m.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`rounded-md px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'agent'
                      ? 'rounded-tl-sm border border-white/[0.08] bg-white/[0.03] text-slate-200'
                      : 'rounded-tr-sm bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'
                  }`}
                >
                  {m.role === 'agent' ? <Markdown text={m.text} /> : m.text}
                </div>
                {m.role === 'agent' && m.agent && (
                  <p className="mt-1 px-1 font-mono text-[10px] text-slate-500">
                    {AGENTS[m.agent]?.label ?? m.agent}
                  </p>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-sm bg-indigo-500/12 text-indigo-300">
                <Loader2 className="size-4 animate-spin" />
              </div>
              <div className="flex items-center gap-1 rounded-md rounded-tl-sm border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
                <span className="size-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.2s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.1s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-indigo-400" />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pb-3">
          {QUICK_PROMPTS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={busy}
              className="rounded-sm border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 transition hover:border-indigo-400/40 hover:text-slate-200 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex items-end gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] p-2 transition focus-within:border-indigo-400/50 focus-within:ring-2 focus-within:ring-indigo-400/15"
        >
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder={`Message ${meta.label}…`}
            className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || busy}
            className="grid size-10 shrink-0 place-items-center rounded-sm bg-gradient-to-r from-indigo-500 to-cyan-500 text-white transition hover:brightness-110 disabled:opacity-50"
          >
            <ArrowUp className="size-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
