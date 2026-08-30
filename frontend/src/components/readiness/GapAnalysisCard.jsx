import React from 'react'
import Badge from '../ui/Badge'
import { AlertOctagon, AlertTriangle } from 'lucide-react'

const formatAreaName = (name = '') => {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const GapAnalysisCard = ({ primaryGap, secondaryGaps = [] }) => {
  return (
    <div className="space-y-4">
      {/* Primary Gap Spotlight */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0d1220] border border-rose-500/25 p-6">
        {/* Ambient rose glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/8 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-rose-400">
            <AlertOctagon className="w-3.5 h-3.5" />
            Primary Readiness Bottleneck
          </div>
          {primaryGap && (
            <Badge variant={primaryGap.status} size="sm">
              {primaryGap.status}
            </Badge>
          )}
        </div>

        {primaryGap ? (
          <div className="space-y-3 relative z-10">
            <div>
              <h4 className="text-2xl font-extrabold text-white tracking-tight mb-1">
                {formatAreaName(primaryGap.area)}
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-400">{primaryGap.score}</span>
                <span className="text-sm text-slate-500 font-medium">/100</span>
                <span className="text-xs text-slate-600 ml-1">Score</span>
              </div>
            </div>

            {/* Mini progress bar for visual score */}
            <div className="h-1.5 w-full max-w-xs bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500/70 rounded-full transition-all duration-1000"
                style={{ width: `${primaryGap.score}%` }}
              />
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              {primaryGap.recommendation
                ? primaryGap.recommendation
                : `Focusing your practice on ${formatAreaName(primaryGap.area)} will produce the largest improvement in your overall readiness.`}
            </p>
          </div>
        ) : (
          <div className="py-3 text-slate-300 text-sm">
            No critical gaps identified. You performed consistently across all core dimensions.
          </div>
        )}
      </div>

      {/* Secondary Gaps */}
      {secondaryGaps.length > 0 && (
        <div className="rounded-2xl bg-[#0d1220] border border-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Secondary Areas to Refine
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {secondaryGaps.map((gap, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/70 border border-amber-500/12 hover:border-amber-500/25 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">
                    {formatAreaName(gap.area)}
                  </span>
                  <Badge size="sm" variant={gap.status}>
                    {gap.score}/100
                  </Badge>
                </div>
                {/* Mini progress */}
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-amber-500/60 rounded-full"
                    style={{ width: `${gap.score}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {gap.recommendation || `Secondary improvement area. Score: ${gap.score}/100.`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GapAnalysisCard
