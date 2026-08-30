import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Brain, FileText, Play, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const navLinkClass = (path) =>
    `flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
      isActive(path)
        ? 'text-[#F3F1EA] bg-white/[0.06] border border-white/[0.08]'
        : 'text-[#8A95A5] hover:text-[#F3F1EA] hover:bg-white/[0.03]'
    }`

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050708]/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Brand Logo (Far Left) */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="w-7 h-7 rounded bg-[#0a0f10] border border-white/10 flex items-center justify-center group-hover:border-[#7C8FB2]/40 transition-colors">
              <Brain className="w-4 h-4 text-[#7C8FB2]" />
            </div>
            <span className="font-bold text-sm text-[#F3F1EA] tracking-tight leading-none">
              Interview<span className="text-[#7C8FB2]">IQ</span>
            </span>
          </Link>

          {/* Centered Navigation Group (Exact Center of Navbar) */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
            {isAuthenticated ? (
              <nav className="flex items-center gap-1.5" aria-label="Main navigation">
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <Link to="/resume" className={navLinkClass('/resume')}>
                  <FileText className="w-3.5 h-3.5" />
                  Resume
                </Link>
                <Link to="/interview/setup" className={navLinkClass('/interview/setup')}>
                  <Play className="w-3.5 h-3.5 text-[#7C8FB2]" />
                  New Interview
                </Link>
              </nav>
            ) : (
              <nav className="flex items-center gap-8 text-xs font-medium text-[#8A95A5]" aria-label="Main navigation">
                <Link to="/" className="hover:text-[#F3F1EA] transition-colors">Home</Link>
                <a href="#how-it-works" className="hover:text-[#F3F1EA] transition-colors">How It Works</a>
              </nav>
            )}
          </div>

          {/* Right Actions (Far Right) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a0f10] border border-white/[0.06] text-xs">
                  <div className="w-4 h-4 rounded-full bg-[#7C8FB2]/20 flex items-center justify-center text-[#7C8FB2] font-bold text-[10px]">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium text-[#F3F1EA] max-w-[120px] truncate">{user?.full_name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#8A95A5] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-xs font-medium text-[#8A95A5] hover:text-[#F3F1EA] transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="text-xs font-medium text-[#8A95A5] hover:text-[#F3F1EA] transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden p-2 text-[#8A95A5] hover:text-[#F3F1EA] transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#090B0E] border-b border-white/10 px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 py-2 mb-2 border-b border-white/10 text-xs text-[#8A95A5]">
                <span className="font-medium text-[#F3F1EA]">{user?.full_name}</span>
                <span className="text-slate-500">· {user?.email}</span>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-xs text-[#F3F1EA]"
              >
                <LayoutDashboard className="w-4 h-4 text-[#8A95A5]" />
                Dashboard
              </Link>
              <Link
                to="/resume"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-xs text-[#F3F1EA]"
              >
                <FileText className="w-4 h-4 text-[#8A95A5]" />
                Resume Management
              </Link>
              <Link
                to="/interview/setup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-xs text-[#7C8FB2]"
              >
                <Play className="w-4 h-4 text-[#7C8FB2]" />
                Start New Interview
              </Link>
              <div className="pt-2 border-t border-white/10 mt-2">
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout() }}
                  className="flex items-center gap-2 w-full py-2 text-rose-400"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3 pt-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-[#8A95A5]">Home</Link>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-xs text-[#8A95A5]">How It Works</a>
              <div className="pt-3 flex items-center gap-6 border-t border-white/10">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium text-[#8A95A5] hover:text-[#F3F1EA] transition-colors">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium text-[#8A95A5] hover:text-[#F3F1EA] transition-colors">
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar
