import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, Sparkles, Target, Award } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-[#050708] mt-auto relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Brand Section (Col 1-5) */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-[#0a0f10] border border-white/10 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-[#7C8FB2]" />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
                INTERVIEWIQ
              </span>
            </div>
            
            <p className="text-xs font-mono text-[#7C8FB2] tracking-wide font-medium">
              Practice smarter. Interview stronger.
            </p>
            
            <p className="text-xs text-[#8A95A5] leading-relaxed max-w-sm">
              AI-powered interview readiness diagnostic — know where you stand and what to improve before the real interview.
            </p>
          </div>

          {/* Capabilities (Col 6-9) */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
              Capabilities
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-[#8A95A5] hover:text-[#F3F1EA] transition-colors group">
                <Sparkles className="w-3.5 h-3.5 text-[#7C8FB2] shrink-0 group-hover:scale-110 transition-transform" />
                <span>Gemini AI Evaluation</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#8A95A5] hover:text-[#F3F1EA] transition-colors group">
                <Target className="w-3.5 h-3.5 text-[#7C8FB2] shrink-0 group-hover:scale-110 transition-transform" />
                <span>Primary Bottleneck Pinpointing</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#8A95A5] hover:text-[#F3F1EA] transition-colors group">
                <Award className="w-3.5 h-3.5 text-[#7C8FB2] shrink-0 group-hover:scale-110 transition-transform" />
                <span>Personalized Action Coaching</span>
              </div>
            </div>
          </div>

          {/* Product Links (Col 10-12) */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
              Product
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/interview/setup" className="text-xs text-[#8A95A5] hover:text-[#F3F1EA] transition-colors w-fit">
                Start Interview
              </Link>
              <Link to="/resume" className="text-xs text-[#8A95A5] hover:text-[#F3F1EA] transition-colors w-fit">
                Resume
              </Link>
              <Link to="/dashboard" className="text-xs text-[#8A95A5] hover:text-[#F3F1EA] transition-colors w-fit">
                Dashboard
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-8 mt-10 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8A95A5]/70 font-mono">
          <span>&copy; {new Date().getFullYear()} InterviewIQ</span>
          <span>Built for better interviews.</span>
        </div>

      </div>
    </footer>
  )
}

export default Footer
