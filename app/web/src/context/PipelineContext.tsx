import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { fetchLearners, streamFlow } from '../api'
import type { Learner, PipelineStep, Verdict } from '../types'

interface PipelineContextValue {
  learners: Learner[]
  selectedId: string
  setSelectedId: (id: string) => void
  selectedLearner: Learner | undefined
  running: boolean
  steps: PipelineStep[]
  verdicts: Verdict[]
  error: string
  run: () => void
}

const PipelineContext = createContext<PipelineContextValue | null>(null)

export function PipelineProvider({ children }: { children: ReactNode }) {
  const [learners, setLearners] = useState<Learner[]>([])
  const [selectedId, setSelectedId] = useState('L-1001')
  const [running, setRunning] = useState(false)
  const [steps, setSteps] = useState<PipelineStep[]>([])
  const [verdicts, setVerdicts] = useState<Verdict[]>([])
  const [error, setError] = useState('')
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    fetchLearners().then((data) => {
      setLearners(data)
      if (data.length > 0 && !data.find((l) => l.learner_id === selectedId)) {
        setSelectedId(data[0].learner_id)
      }
    })
    return () => stopRef.current?.()
  }, [])

  const handleLearnerChange = useCallback(
    (id: string) => {
      if (running) return
      setSelectedId(id)
      setSteps([])
      setVerdicts([])
      setError('')
    },
    [running],
  )

  const run = useCallback(() => {
    stopRef.current?.()
    setSteps([])
    setVerdicts([])
    setError('')
    setRunning(true)
    stopRef.current = streamFlow(selectedId, {
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
  }, [selectedId])

  const selectedLearner = learners.find((l) => l.learner_id === selectedId)

  return (
    <PipelineContext.Provider
      value={{
        learners,
        selectedId,
        setSelectedId: handleLearnerChange,
        selectedLearner,
        running,
        steps,
        verdicts,
        error,
        run,
      }}
    >
      {children}
    </PipelineContext.Provider>
  )
}

export function usePipeline() {
  const ctx = useContext(PipelineContext)
  if (!ctx) throw new Error('usePipeline must be used within PipelineProvider')
  return ctx
}
