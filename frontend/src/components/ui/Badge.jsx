import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, Shield, Zap } from 'lucide-react'

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }

  // Variant matching
  let styles = 'bg-slate-800/80 text-slate-300 border-slate-700/60'
  let IconComponent = null

  const normalized = (typeof children === 'string' ? children.toLowerCase() : variant).toLowerCase()

  if (normalized === 'ready' || normalized === 'strong' || normalized === 'completed') {
    styles = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    IconComponent = CheckCircle2
  } else if (
    normalized === 'needs improvement' ||
    normalized === 'medium' ||
    normalized === 'in_progress' ||
    normalized === 'in progress'
  ) {
    styles = 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    IconComponent = AlertTriangle
  } else if (normalized === 'not ready' || normalized === 'gap' || normalized === 'hard') {
    styles = 'bg-rose-500/10 text-rose-300 border-rose-500/30'
    IconComponent = XCircle
  } else if (normalized === 'easy' || normalized === 'created') {
    styles = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
    IconComponent = Sparkles
  } else if (normalized === 'technical') {
    styles = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
    IconComponent = Zap
  } else if (normalized === 'hr' || normalized === 'behavioral') {
    styles = 'bg-purple-500/10 text-purple-300 border-purple-500/30'
    IconComponent = Shield
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${sizeClasses[size] || sizeClasses.md} ${styles} ${className}`}
    >
      {icon && IconComponent && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  )
}

export default Badge
