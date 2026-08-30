import React from 'react'

export const ProgressBar = ({
  label,
  value = 0,
  max = 100,
  description = '',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  let gradient = 'from-emerald-500 to-teal-400'
  let textColor = 'text-emerald-400'

  if (percentage < 70) {
    gradient = 'from-rose-500 to-pink-500'
    textColor = 'text-rose-400'
  } else if (percentage < 80) {
    gradient = 'from-amber-500 to-yellow-400'
    textColor = 'text-amber-400'
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-slate-200">{label}</span>
          {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-base font-bold ${textColor}`}>{value}</span>
          <span className="text-xs text-slate-500">/{max}</span>
        </div>
      </div>

      <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
