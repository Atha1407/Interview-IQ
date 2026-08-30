import React from 'react'

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-800/60 border border-slate-700/30 ${className}`}
      {...props}
    />
  )
}

export const SkeletonCard = ({ rows = 3, className = '' }) => {
  return (
    <div className={`glass-panel p-6 rounded-2xl space-y-4 ${className}`}>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  )
}

export default Skeleton
