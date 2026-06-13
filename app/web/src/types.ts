export interface Learner {
  learner_id: string
  team: string
  role: string
  certification_target: string
  practice_score_avg: number
  hours_studied: number
  assessments_taken: number
  last_exam_outcome: string
  signals: {
    meeting_hours_per_week?: number
    focus_hours_per_week?: number
    preferred_learning_slot?: string
    best_days?: string[]
  }
  certification: {
    id?: string
    name?: string
    level?: string
    recommended_hours?: number
    pass_threshold_practice?: number
    skills?: string[]
  }
  max_weekly_study_hours: number
}

export interface Team {
  team: string
  members: number
  avg_practice_score: number
  avg_hours_studied: number
  capacity_constrained_members: number
  certifications_in_progress: string[]
}

export interface EvalResult {
  case_id: string
  agent: string
  citation_coverage: boolean
  self_corrected?: boolean
  deterministic: Record<string, { passed: boolean; detail: string }>
  groundedness: number | null
  task_adherence: number | null
  rule_compliance: number | null
  rationale: string
  answer_preview: string
}

export interface EvalRun {
  timestamp: string
  results: EvalResult[]
}

export type StepStatus = 'idle' | 'running' | 'done' | 'error'

export interface PipelineStep {
  agent: string
  label: string
  status: StepStatus
  prompt?: string
  text?: string
  revision?: boolean
  round?: number
}

export interface Verdict {
  round: number
  verdict: 'approve' | 'revise'
  violations: string[]
  suggested_fix: string
}
