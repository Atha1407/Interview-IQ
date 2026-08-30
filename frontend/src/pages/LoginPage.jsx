import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'
import { Brain, Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

export const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    try {
      setLoading(true)
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center px-4 py-12 text-[#F3F1EA]">
      <div className="w-full max-w-sm">
        {/* Brand Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-[#0a0f10] border border-white/10 flex items-center justify-center group-hover:border-[#7C8FB2]/40 transition-colors">
              <Brain className="w-4 h-4 text-[#7C8FB2]" />
            </div>
            <span className="font-bold text-base text-[#F3F1EA] tracking-tight">
              Interview<span className="text-[#7C8FB2]">IQ</span>
            </span>
          </Link>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#F3F1EA] tracking-tight mb-1.5">
            Welcome back
          </h1>
          <p className="text-xs text-[#8A95A5] leading-relaxed">
            Sign in to access your interview dashboard and readiness reports.
          </p>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-[#8A95A5]">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-[#8A95A5]" />
              </div>
              <input
                id="login-email"
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
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-[#8A95A5]">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-[#8A95A5]" />
              </div>
              <input
                id="login-password"
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
            icon={LogIn}
            className="w-full py-2.5 mt-2"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/[0.08] text-center text-xs text-[#8A95A5]">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#7C8FB2] hover:text-[#9aaecf] transition-colors">
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
