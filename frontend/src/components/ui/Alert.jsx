import React from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

export const Alert = ({
  type = 'error',
  title,
  message,
  onClose,
  className = '',
}) => {
  const configs = {
    error: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-400',
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    info: {
      bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200',
      icon: Info,
      iconColor: 'text-indigo-400',
    },
  }

  const config = configs[type] || configs.error
  const Icon = config.icon

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg} backdrop-blur-sm ${className}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 text-sm">
        {title && <h5 className="font-semibold text-white mb-0.5">{title}</h5>}
        {message && <div className="text-slate-300 leading-relaxed">{message}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default Alert
