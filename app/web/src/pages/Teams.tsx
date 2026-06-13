import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Award, Clock3, Lock, Users } from 'lucide-react'
import { fetchTeams } from '../api'
import type { Team } from '../types'

const TEAM_COLORS = [
  { ring: 'from-indigo-500 to-violet-500', text: 'text-indigo-300' },
  { ring: 'from-cyan-500 to-sky-500', text: 'text-cyan-300' },
  { ring: 'from-emerald-500 to-teal-500', text: 'text-emerald-300' },
]

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

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    fetchTeams().then(setTeams)
  }, [])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white">
          <Users size={22} className="text-indigo-400" />
          Team Insights
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          What the Manager Insights agent sees — aggregates only, by design.
        </p>
      </header>

      <div className="glass flex items-center gap-3 border-indigo-400/20 bg-indigo-500/[0.05] px-5 py-3.5">
        <Lock size={16} className="shrink-0 text-indigo-300" />
        <p className="text-[12.5px] text-slate-300">
          <span className="font-semibold text-white">Rule BR-005 enforced:</span> individual practice scores are never
          exposed at this level. The Critic agent rejects any output that violates it.
        </p>
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
                  <span className={`text-[13px] font-semibold ${team.capacity_constrained_members > 0 ? 'text-amber-300' : 'text-white'}`}>
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
