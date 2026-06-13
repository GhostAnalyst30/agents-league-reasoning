import type { EvalRun, Learner, Team } from './types'

export const fetchLearners = (): Promise<Learner[]> =>
  fetch('/api/learners').then((r) => r.json())

export const fetchTeams = (): Promise<Team[]> => fetch('/api/teams').then((r) => r.json())

export const fetchEvals = (): Promise<EvalRun[]> => fetch('/api/evals').then((r) => r.json())

export const sendChat = (agent: string, message: string): Promise<{ text: string }> =>
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent, message }),
  }).then((r) => r.json())

export interface FlowHandlers {
  onStepStart: (d: { agent: string; label: string; prompt: string; revision?: boolean; round?: number }) => void
  onStepDone: (d: { agent: string; text: string; revision?: boolean }) => void
  onVerdict: (d: { round: number; verdict: 'approve' | 'revise'; violations: string[]; suggested_fix: string }) => void
  onDone: () => void
  onError: (message: string) => void
}

export function streamFlow(learnerId: string, handlers: FlowHandlers): () => void {
  const es = new EventSource(`/api/flow/${learnerId}/stream`)
  es.addEventListener('step_start', (e) => handlers.onStepStart(JSON.parse(e.data)))
  es.addEventListener('step_done', (e) => handlers.onStepDone(JSON.parse(e.data)))
  es.addEventListener('verdict', (e) => handlers.onVerdict(JSON.parse(e.data)))
  es.addEventListener('done', () => {
    es.close()
    handlers.onDone()
  })
  es.addEventListener('error', (e) => {
    const msg = (e as MessageEvent).data
    es.close()
    handlers.onError(msg ? JSON.parse(msg).message : 'stream interrupted')
  })
  return () => es.close()
}
