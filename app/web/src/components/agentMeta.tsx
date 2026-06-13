import {
  BellRing,
  CalendarRange,
  ClipboardCheck,
  Map,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface AgentInfo {
  label: string
  icon: LucideIcon
  color: string
  bg: string
  border: string
  description: string
}

export const AGENTS: Record<string, AgentInfo> = {
  curator: {
    label: 'Learning Path Curator',
    icon: Map,
    color: 'text-indigo-300',
    bg: 'bg-indigo-500/15',
    border: 'border-indigo-400/30',
    description: 'Maps the learner to skills and an approved, cited study sequence',
  },
  planner: {
    label: 'Study Plan Generator',
    icon: CalendarRange,
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-400/30',
    description: 'Builds a weekly plan that never exceeds real study capacity',
  },
  engagement: {
    label: 'Engagement Agent',
    icon: BellRing,
    color: 'text-amber-300',
    bg: 'bg-amber-500/15',
    border: 'border-amber-400/30',
    description: 'Schedules reminders aligned to the learner\u2019s work rhythm',
  },
  assessor: {
    label: 'Assessment Agent',
    icon: ClipboardCheck,
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-400/30',
    description: 'Applies readiness rules and generates grounded practice questions',
  },
  manager_insights: {
    label: 'Manager Insights',
    icon: Users,
    color: 'text-fuchsia-300',
    bg: 'bg-fuchsia-500/15',
    border: 'border-fuchsia-400/30',
    description: 'Privacy-preserving team aggregates, never individual scores',
  },
  critic: {
    label: 'Critic / Verifier',
    icon: ShieldCheck,
    color: 'text-rose-300',
    bg: 'bg-rose-500/15',
    border: 'border-rose-400/30',
    description: 'Gates every output against the business rules before release',
  },
}
