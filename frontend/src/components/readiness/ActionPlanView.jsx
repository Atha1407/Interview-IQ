import React from 'react'
import Card, { CardTitle } from '../ui/Card'
import { Sparkles, Target, ArrowRight } from 'lucide-react'

const STEP_STYLES = [
  {
    numberBg: 'bg-rose-600/20 border border-rose-500/30 text-rose-300',
    border: 'border-rose-500/20',
    label: 'Highest Priority',
    labelColor: 'text-rose-400',
  },
  {
    numberBg: 'bg-amber-600/20 border border-amber-500/30 text-amber-300',
    border: 'border-amber-500/20',
    label: 'High Priority',
    labelColor: 'text-amber-400',
  },
]

const DEFAULT_STYLE = {
  numberBg: 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300',
  border: 'border-slate-800/60',
  label: null,
  labelColor: null,
}

export const ActionPlanView = ({ actionPlan = [] }) => {
  if (!actionPlan || actionPlan.length === 0) {
    return (
      <Card>
        <CardTitle icon={Sparkles} className="text-indigo-400 mb-2">
          Personalized Action Plan
        </CardTitle>
        <p className="text-sm text-slate-400">
          No action plan generated yet. Complete an interview to receive custom recommendations.
        </p>
      </Card>
    )
  }

  return (
    <Card glow className="bg-gradient-to-br from-indigo-950/15 via-slate-900/60 to-slate-950/90 border-indigo-500/25">
      {/* Header */}
      <div className="flex items-start justify-between pb-5 mb-6 border-b border-slate-800/60">
        <div>
          <p className="section-label mb-1.5">
            <Sparkles className="w-3 h-3" />
            AI Coach Roadmap
          </p>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Your Personalized Action Plan
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Work through these steps in order. Earlier steps address your highest-impact gaps.
          </p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 shrink-0 ml-4">
          {actionPlan.length} Steps
        </span>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {actionPlan.map((step, idx) => {
          const style = STEP_STYLES[idx] || DEFAULT_STYLE
          return (
            <div
              key={idx}
              className={`flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border ${style.border} hover:border-slate-700/60 transition-colors group`}
            >
              {/* Step number */}
              <div className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${style.numberBg}`}>
                {idx + 1}
              </div>

              {/* Step content */}
              <div className="flex-1 space-y-1 min-w-0">
                {style.label && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${style.labelColor}`}>
                    {style.label}
                  </span>
                )}
                <p className="text-sm text-slate-200 leading-relaxed">{step}</p>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-1 group-hover:text-slate-400 transition-colors" />
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-500">
        <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        Complete step 1 first for the greatest improvement in your readiness score.
      </div>
    </Card>
  )
}

export default ActionPlanView
