import React from 'react'
import ScoreRing from '../ui/ScoreRing'
import Badge from '../ui/Badge'
import Card from '../ui/Card'
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'

export const ReadinessScoreGauge = ({ readiness }) => {
  if (!readiness) return null

  const { readiness_score, readiness_status } = readiness

  let statusText = 'You meet key benchmarks for interview readiness.'
  let statusIcon = CheckCircle2
  let statusColor = 'text-emerald-400'

  if (readiness_status === 'Needs Improvement') {
    statusText = 'You have foundational knowledge but specific skill gaps require targeted practice.'
    statusIcon = AlertCircle
    statusColor = 'text-amber-400'
  } else if (readiness_status === 'Not Ready') {
    statusText = 'Significant gaps identified across core criteria. Follow the action plan to build competency.'
    statusIcon = AlertCircle
    statusColor = 'text-rose-400'
  }

  const StatusIcon = statusIcon

  return (
    <Card glow className="relative overflow-hidden flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80">
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-radial-glow opacity-60 pointer-events-none" />

      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-6">
        <Sparkles className="w-4 h-4" />
        <span>AI Readiness Evaluation</span>
      </div>

      {/* Main Circular Score */}
      <ScoreRing
        score={readiness_score}
        max={100}
        size={210}
        strokeWidth={16}
        sublabel={readiness_status}
        label=""
      />

      <div className="mt-6 flex flex-col items-center gap-3 max-w-sm">
        <Badge size="lg" variant={readiness_status}>
          {readiness_status}
        </Badge>

        <p className="text-xs text-slate-400 leading-relaxed mt-1 flex items-start gap-1.5 text-center">
          <StatusIcon className={`w-4 h-4 shrink-0 mt-0.5 ${statusColor}`} />
          <span>{statusText}</span>
        </p>
      </div>
    </Card>
  )
}

export default ReadinessScoreGauge
