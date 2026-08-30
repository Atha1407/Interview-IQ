import React from 'react'

export const Card = ({
  children,
  className = '',
  hover = false,
  glow = false,
  bordered = false,
  as: Tag = 'div',
  ...props
}) => {
  let cardClass = 'glass-panel'
  if (glow) cardClass = 'glass-panel-glow'
  else if (hover) cardClass = 'glass-card glass-card-hover'
  else if (bordered) cardClass = 'card-bordered'

  return (
    <Tag
      className={`rounded-2xl transition-all duration-200 ${cardClass} p-6 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between pb-4 mb-4 border-b border-slate-800/70 ${className}`}>
    {children}
  </div>
)

export const CardTitle = ({ children, icon: Icon, className = '' }) => (
  <h3 className={`text-base font-semibold text-white flex items-center gap-2 ${className}`}>
    {Icon && <Icon className="w-4 h-4 text-indigo-400 shrink-0" />}
    <span>{children}</span>
  </h3>
)

export default Card
