import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import {
  Sparkles,
  ArrowRight,
  FileText,
  Play,
  Target,
  Award,
  CheckCircle2,
  Brain,
} from 'lucide-react'

export const LandingPage = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="bg-transparent text-[#F3F1EA] overflow-hidden relative z-10">
      {/* ─── HERO SECTION ───────────────────────────────────── */}
      <section className="relative pt-20 md:pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="relative z-10 space-y-8">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a0f10]/80 border border-[#7C8FB2]/30 text-[#7C8FB2] text-xs font-mono tracking-wider animate-fade-in backdrop-blur-sm">
            <Brain className="w-3.5 h-3.5" />
            <span>INTERVIEW READINESS</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F3F1EA] tracking-tight leading-[1.08] max-w-4xl mx-auto animate-fade-in-up delay-100">
            Know where you stand <br />
            <span className="text-[#7C8FB2]">before the real interview.</span>
          </h1>

          {/* Supporting Description */}
          <p className="text-base sm:text-lg text-[#8A95A5] max-w-2xl mx-auto font-normal leading-relaxed animate-fade-in-up delay-200">
            Practice with a realistic interview, understand where you stand, and know what to work on before the real thing.
          </p>

          {/* Hero CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Link to={isAuthenticated ? '/interview/setup' : '/register'}>
              <Button size="xl" variant="mint" icon={Play}>
                Start Your Interview
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="xl" variant="mint-outline" icon={ArrowRight}>
                See How It Works
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (Connected Product Workflow) ─────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">Workflow</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F3F1EA] tracking-tight">
            How InterviewIQ works
          </h2>
          <p className="text-[#8A95A5] text-sm leading-relaxed max-w-lg mx-auto">
            Five clear steps from initial preparation to focused improvement.
          </p>
        </div>

        <div className="relative">
          {/* Desktop connecting progression line */}
          <div className="hidden md:block absolute top-[28px] left-[5%] right-[5%] h-[2px] bg-gradient-to-r from-[#7C8FB2]/10 via-[#7C8FB2]/40 to-[#7C8FB2]/10 pointer-events-none z-0" aria-hidden="true" />

          {/* Mobile connecting vertical line */}
          <div className="block md:hidden absolute top-6 bottom-6 left-6 w-[2px] bg-gradient-to-b from-[#7C8FB2]/10 via-[#7C8FB2]/40 to-[#7C8FB2]/10 pointer-events-none z-0" aria-hidden="true" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
            {[
              { step: '01', title: 'Upload Resume', desc: 'Align interview context to your experience and role level.', icon: FileText },
              { step: '02', title: 'Take Interview', desc: 'Respond to technical, behavioral, or HR questions.', icon: Play },
              { step: '03', title: 'Get Evaluated', desc: 'Receive structured feedback across core response dimensions.', icon: Sparkles },
              { step: '04', title: 'Understand Gaps', desc: 'Identify specific areas that need further preparation.', icon: Target },
              { step: '05', title: 'Action Plan', desc: 'Follow recommended practice steps for your next attempt.', icon: Award },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="relative flex flex-col p-6 rounded-xl bg-[#0a0f10]/80 border border-white/10 hover:border-[#7C8FB2]/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold font-mono text-[#7C8FB2]">
                      {item.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[#050708] border border-white/10 flex items-center justify-center group-hover:border-[#7C8FB2]/40 transition-colors">
                      <Icon className="w-4 h-4 text-[#8A95A5] group-hover:text-[#F3F1EA] transition-transform group-hover:scale-110" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#F3F1EA] mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-xs text-[#8A95A5] leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA SECTION ────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center border-t border-white/[0.06]">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F3F1EA] tracking-tight">
            Ready to see where you stand?
          </h2>
          <p className="text-[#8A95A5] text-sm max-w-md mx-auto leading-relaxed">
            Start a simulation session to measure your interview readiness.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={isAuthenticated ? '/interview/setup' : '/register'}>
              <Button size="xl" variant="mint" icon={Play}>
                Start Your Interview
              </Button>
            </Link>
          </div>

          {/* Product Specific Benefit Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-[#8A95A5]">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7C8FB2] shrink-0" />
              <span>AI-powered answer evaluation</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7C8FB2] shrink-0" />
              <span>Personalized improvement insights</span>
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7C8FB2] shrink-0" />
              <span>Readiness score & key bottleneck</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
