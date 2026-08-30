import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'
import { Brain, Lock, Mail, User, Eye, EyeOff, UserPlus } from 'lucide-react'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

export const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters.')
      return
    }
    if (!email.trim()) {
      setError('Please provide a valid email address.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    try {
      setLoading(true)
      await register(email.trim(), password, fullName.trim())
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center px-4 py-12 text-[#F3F1EA] relative z-10">
      <div className="w-full max-w-sm p-6 sm:p-8 rounded-2xl bg-[#0a0f10]/80 border border-white/[0.08] backdrop-blur-md shadow-2xl shadow-black/40">
        
        {/* Brand Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#050708] border border-white/10 flex items-center justify-center group-hover:border-[#7C8FB2]/40 transition-colors">
              <Brain className="w-4 h-4 text-[#7C8FB2]" />
            </div>
            <span className="font-bold text-base text-[#F3F1EA] tracking-tight">
              Interview<span className="text-[#7C8FB2]">IQ</span>
            </span>
          </Link>
        </div>

        {/* Page Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-[#F3F1EA] tracking-tight mb-1">
            Create your account
          </h1>
          <p className="text-xs text-[#8A95A5] leading-relaxed">
            Start measuring and improving your interview readiness.
          </p>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            className="mb-5"
          />
        )}

        {/* Compact Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div className="space-y-1">
            <label htmlFor="register-name" className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#8A95A5]">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-[#8A95A5]" />
              </div>
              <input
                id="register-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="form-input form-input-icon"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="register-email" className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#8A95A5]">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-[#8A95A5]" />
              </div>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input form-input-icon"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label htmlFor="register-password" className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#8A95A5]">
              Password{' '}
              <span className="text-[#8A95A5]/60 font-normal font-sans normal-case tracking-normal">(min 8 chars)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-[#8A95A5]" />
              </div>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input form-input-icon form-input-icon-right"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A95A5] hover:text-[#F3F1EA] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="mint"
            loading={loading}
            icon={UserPlus}
            className="w-full py-2.5 mt-2 font-bold"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-5 pt-5 border-t border-white/[0.08] text-center text-xs text-[#8A95A5]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#7C8FB2] hover:text-[#9aaecf] transition-colors">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  )
}

export default RegisterPage
