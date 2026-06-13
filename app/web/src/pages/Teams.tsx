import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Award, Clock3, GraduationCap, Gauge, ShieldCheck, Trophy, Users } from 'lucide-react'
import { DonutChart } from '../components/DonutChart'
import { fetchTeams } from '../api'
import type { Team } from '../types'

const TEAM_COLORS = [
  { ring: 'from-indigo-500 to-violet-500', text: 'text-indigo-300' },
  { ring: 'from-cyan-500 to-sky-500', text: 'text-cyan-300' },
  { ring: 'from-emerald-500 to-teal-500', text: 'text-emerald-300' },
]

const CHART_COLORS = ['#6366f1', '#38bdf8', '#34d399', '#fbbf24', '#e879f9', '#64748b']

function useCountUp(target: number, run: boolean, ms = 900) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / ms, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, ms])
  return val
}

function ScoreRing({ value, gradient }: { value: number; gradient: string }) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const progress = (value / 100) * circumference
  const gradientId = `ring-${gradient.replace(/[^a-z0-9]/gi, '')}`
  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="7" className="stroke-white/[0.07]" />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${progress} ${circumference}` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white">{value}%</span>
        <span className="text-[9px] font-medium uppercase tracking-wide text-slate-500">practice</span>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  suffix,
  sub,
  icon: Icon,
  tint,
  run,
  delay,
}: {
  label: string
  value: number
  suffix: string
  sub: string
  icon: typeof Users
  tint: string
  run: boolean
  delay: number
}) {
  const v = useCountUp(value, run)
  return (
    <div
      className="cp-fade-up group rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors hover:border-indigo-400/30"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={`grid size-10 place-items-center rounded-2xl ${tint}`}>
        <Icon className="size-5" />
      </span>
      <p className="mt-3 font-heading text-3xl font-extrabold tabular-nums tracking-tight text-white">
        {v}
        <span className="text-xl">{suffix}</span>
      </p>
      <p className="text-sm font-medium text-slate-200">{label}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  )
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetchTeams().then(setTeams)
    const t = setTimeout(() => setReady(true), 60)
    return () => clearTimeout(t)
  }, [])

  const totalMembers = teams.reduce((s, t) => s + t.members, 0)
  const avgReadiness = teams.length
    ? Math.round(teams.reduce((s, t) => s + t.avg_practice_score, 0) / teams.length)
    : 0
  const certsInProgress = teams.reduce((s, t) => s + t.certifications_in_progress.length, 0)
  const constrained = teams.reduce((s, t) => s + t.capacity_constrained_members, 0)

  const certCounts: Record<string, number> = {}
  teams.forEach((t) =>
    t.certifications_in_progress.forEach((c) => {
      certCounts[c] = (certCounts[c] ?? 0) + 1
    }),
  )
  const certDistribution = Object.entries(certCounts).map(([label, value], i) => ({
    label,
    value,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))

  const metrics = [
    {
      id: 'learners',
      label: 'Learners tracked',
      value: totalMembers,
      suffix: '',
      sub: `across ${teams.length} teams`,
      icon: Users,
      tint: 'text-indigo-300 bg-indigo-500/10',
    },
    {
      id: 'readiness',
      label: 'Avg readiness',
      value: avgReadiness,
      suffix: '%',
      sub: 'team aggregate practice scores',
      icon: Gauge,
      tint: 'text-cyan-300 bg-cyan-500/10',
    },
    {
      id: 'progress',
      label: 'Certs in progress',
      value: certsInProgress,
      suffix: '',
      sub: `${constrained} capacity constrained`,
      icon: GraduationCap,
      tint: 'text-amber-300 bg-amber-500/15',
    },
    {
      id: 'done',
      label: 'Teams monitored',
      value: teams.length,
      suffix: '',
      sub: 'manager-level aggregates',
      icon: Trophy,
      tint: 'text-emerald-300 bg-emerald-500/12',
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <MetricCard key={m.id} {...m} run={ready} delay={i * 70} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5">
          <h3 className="font-heading text-sm font-bold text-white">Team readiness</h3>
          <p className="mb-4 text-xs text-slate-400">Aggregate readiness per team</p>
          <div className="flex flex-col gap-4">
            {teams.map((t, i) => (
              <div key={t.team} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm font-medium text-slate-200">{t.team}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    style={{
                      width: ready ? `${t.avg_practice_score}%` : '0%',
                      transition: `width 1s cubic-bezier(0.22,1,0.36,1) ${i * 90}ms`,
                    }}
                  />
                </div>
                <span className="w-10 text-right text-sm font-bold tabular-nums text-indigo-300">
                  {t.avg_practice_score}%
                </span>
              </div>
            ))}
          </div>
        </section>

        {certDistribution.length > 0 && (
          <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5">
            <h3 className="font-heading text-sm font-bold text-white">Certification distribution</h3>
            <p className="mb-4 text-xs text-slate-400">Active certifications by track</p>
            <DonutChart data={certDistribution} />
          </section>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-300">
        <ShieldCheck className="size-5 shrink-0" />
        <span>
          <span className="font-semibold">BR-005 enforced</span> — the manager view shows only team aggregates. No
          individual scores are ever exposed.
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {teams.map((team, i) => {
          const color = TEAM_COLORS[i % TEAM_COLORS.length]
          return (
            <motion.div
              key={team.team}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className="glass glass-hover p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-white">{team.team}</div>
                  <div className="text-[11.5px] text-slate-500">{team.members} members tracked</div>
                </div>
                <ScoreRing value={team.avg_practice_score} gradient={team.team} />
              </div>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                  <span className="flex items-center gap-2 text-[12px] text-slate-400">
                    <Clock3 size={13} className={color.text} /> Avg study hours
                  </span>
                  <span className="text-[13px] font-semibold text-white">{team.avg_hours_studied}h</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                  <span className="flex items-center gap-2 text-[12px] text-slate-400">
                    <AlertTriangle size={13} className="text-amber-400" /> Capacity constrained
                  </span>
                  <span
                    className={`text-[13px] font-semibold ${team.capacity_constrained_members > 0 ? 'text-amber-300' : 'text-white'}`}
                  >
                    {team.capacity_constrained_members}
                  </span>
                </div>
                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <span className="flex items-center gap-2 text-[12px] text-slate-400">
                    <Award size={13} className={color.text} /> Certifications in progress
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {team.certifications_in_progress.map((cert) => (
                      <span key={cert} className="chip border border-white/10 bg-white/[0.05] font-mono text-slate-300">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
