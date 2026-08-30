import React from 'react'
import Card, { CardTitle } from '../ui/Card'
import { Award, CheckCircle2 } from 'lucide-react'

const formatAreaName = (name = '') => {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const StrongAreasCard = ({ strongAreas = [] }) => {
  return (
    <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-950/15 via-slate-900/60 to-slate-950/80">
      <CardTitle icon={Award} className="text-base text-emerald-400 mb-4">
        Demonstrated Strengths
      </CardTitle>

      {strongAreas && strongAreas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {strongAreas.map((area, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 text-sm font-medium text-emerald-200"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span>{formatAreaName(area)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 leading-relaxed">
          No strong benchmark (&gt;80%) achieved in this session yet. Complete the action plan to build mastery.
        </p>
      )}
    </Card>
  )
}

export default StrongAreasCard
