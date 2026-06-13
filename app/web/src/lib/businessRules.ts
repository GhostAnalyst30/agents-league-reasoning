export const BUSINESS_RULES = [
  { id: 'BR-001', text: 'Readiness gate of 75% applied — every verdict is explicit.' },
  { id: 'BR-002', text: 'Study-capacity ceiling respected (computed weekly hours).' },
  { id: 'BR-003', text: 'No Expert cert without prerequisites — path validated.' },
  { id: 'BR-004', text: 'Plan hours stay within capacity — no overload scheduled.' },
  { id: 'BR-005', text: 'Manager insights are team-only — no individual score exposed.' },
]

export const CITATIONS = [
  { ref: 1, title: 'Certification Catalog v2024', desc: 'Roles, prerequisites and skill maps per certification.' },
  { ref: 2, title: 'Assessment & Policy Guide', desc: 'Readiness gates (BR-001) and weekly capacity limits (BR-002 / BR-004).' },
  { ref: 3, title: 'Quarterly Learning Report', desc: 'Practice-set ratios and historical pass-rate data.' },
  { ref: 4, title: 'Workload Insights', desc: 'Meeting patterns, focus hours and scheduling signals.' },
]

export const AGENT_RULES: Record<string, string[]> = {
  curator: ['BR-003'],
  planner: ['BR-002', 'BR-004'],
  engagement: [],
  assessor: ['BR-001'],
  manager_insights: ['BR-005'],
  critic: ['BR-001', 'BR-002', 'BR-003', 'BR-004', 'BR-005'],
}
