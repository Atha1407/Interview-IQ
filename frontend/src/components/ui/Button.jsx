import React from 'react'
import { Loader2 } from 'lucide-react'

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C8FB2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050708] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer'

  const variants = {
    primary:
      'bg-[#7C8FB2] hover:bg-[#6A7B9B] text-[#050708] font-bold shadow-md shadow-[#7C8FB2]/15 border border-[#7C8FB2]/40 active:scale-[0.99]',
    secondary:
      'bg-[#0a0f10] hover:bg-white/[0.04] text-[#F3F1EA] border border-white/[0.06] hover:border-white/15 active:scale-[0.99]',
    outline:
      'bg-transparent hover:bg-white/[0.04] text-[#8A95A5] hover:text-[#F3F1EA] border border-white/[0.06] hover:border-white/15',
    danger:
      'bg-rose-600/90 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 border border-rose-500/30 active:scale-[0.99]',
    ghost:
      'bg-transparent hover:bg-white/[0.05] text-[#8A95A5] hover:text-[#F3F1EA]',
    glow:
      'bg-[#7C8FB2] hover:bg-[#6A7B9B] text-[#050708] font-bold shadow-lg shadow-[#7C8FB2]/20 border border-[#7C8FB2]/40 active:scale-[0.99]',
    mint:
      'bg-[#7C8FB2] hover:bg-[#6A7B9B] text-[#050708] font-bold border border-[#7C8FB2]/40 transition-all duration-200 active:scale-[0.99]',
    'mint-outline':
      'bg-[#0a0f10]/80 hover:bg-[#0a0f10] text-[#F3F1EA] hover:text-white border border-white/15 hover:border-white/30 transition-all duration-200',
  }

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-4.5 py-2.5 gap-2',
    lg: 'text-sm px-5.5 py-3 gap-2.5',
    xl: 'text-base px-7 py-3.5 gap-2.5',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  )
}

export default Button
