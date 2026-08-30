import React, { useId } from 'react'

export const ScoreRing = ({
  score = 0,
  max = 100,
  size = 180,
  strokeWidth = 14,
  label = 'Readiness Score',
  sublabel = '',
  className = '',
}) => {
  const reactId = useId()
  const percentage = Math.min(100, Math.max(0, Math.round((score / max) * 100)))
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  let colorGradient = {
    start: '#10b981', // emerald
    end: '#059669',
    glow: 'rgba(16, 185, 129, 0.25)',
    textColor: 'text-emerald-400',
  }

  if (percentage < 70) {
    colorGradient = {
      start: '#f43f5e', // rose
      end: '#e11d48',
      glow: 'rgba(244, 63, 94, 0.25)',
      textColor: 'text-rose-400',
    }
  } else if (percentage < 80) {
    colorGradient = {
      start: '#f59e0b', // amber
      end: '#d97706',
      glow: 'rgba(245, 158, 11, 0.25)',
      textColor: 'text-amber-400',
    }
  }

  const gradientId = `score-gradient-${reactId.replace(/:/g, '')}`

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] transition-all duration-1000 ease-out"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorGradient.start} />
              <stop offset="100%" stopColor={colorGradient.end} />
            </linearGradient>
            <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline justify-center">
            <span className={`text-4xl lg:text-5xl font-extrabold tracking-tight ${colorGradient.textColor}`}>
              {score}
            </span>
            <span className="text-sm font-medium text-slate-400 ml-1">/{max}</span>
          </div>
          {sublabel && (
            <span className="text-xs font-semibold text-slate-300 mt-1 uppercase tracking-wider">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {label && <p className="text-sm font-medium text-slate-400 mt-3 text-center">{label}</p>}
    </div>
  )
}

export default ScoreRing
