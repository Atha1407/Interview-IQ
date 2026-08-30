import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { interviewService } from '../services/interviewService'
import { getErrorMessage } from '../services/api'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { Skeleton } from '../components/ui/Skeleton'
import {
  Printer,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  Zap,
  Target,
  FileCheck,
  MessageSquareText,
} from 'lucide-react'

const formatAreaName = (name = '') => {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const getStatusStyles = (status) => {
  if (!status) return { text: 'text-[#8A95A5]', border: 'border-[#8A95A5]/30', bg: 'bg-[#8A95A5]/10' }
  const s = status.toLowerCase()
  if (s.includes('ready') && !s.includes('not')) return { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' }
  if (s.includes('needs improvement')) return { text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' }
  return { text: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' }
}

const getDimensionIcon = (key) => {
  const k = key.toLowerCase()
  if (k.includes('tech')) return Zap
  if (k.includes('relev')) return Target
  if (k.includes('complet')) return FileCheck
  return MessageSquareText
}

const ProgressRing = ({ score, size = 150, strokeWidth = 8, colorClass = "text-[#7C8FB2]" }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/[0.04]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl md:text-5xl font-light tracking-tighter text-[#F3F1EA]">
          {score}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8A95A5] mt-0.5 font-mono">
          / 100
        </span>
      </div>
    </div>
  )
}

export const ResultsPage = () => {
  const { id: sessionId } = useParams()

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reEvaluating, setReEvaluating] = useState(false)
  const [error, setError] = useState('')
  const [expandedQuestions, setExpandedQuestions] = useState({})

  const fetchResult = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      let data = await interviewService.getResult(sessionId)

      if (data.status === 'completed' && (!data.readiness || data.overall_score === null)) {
        try {
          await interviewService.evaluateSession(sessionId)
          data = await interviewService.getResult(sessionId)
        } catch {
          // Fallback if evaluate had an issue
        }
      }

      setResult(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchResult()
  }, [fetchResult])

  const handleReEvaluate = async () => {
    try {
      setReEvaluating(true)
      setError('')
      await interviewService.evaluateSession(sessionId)
      const data = await interviewService.getResult(sessionId)
      setResult(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setReEvaluating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const toggleQuestion = (idx) => {
    setExpandedQuestions(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <Skeleton className="h-20 w-1/2 rounded-xl bg-[#0a0f10]" />
        <Skeleton className="h-56 rounded-2xl bg-[#0a0f10]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-xl bg-[#0a0f10]" />
          <Skeleton className="h-28 rounded-xl bg-[#0a0f10]" />
          <Skeleton className="h-28 rounded-xl bg-[#0a0f10]" />
          <Skeleton className="h-28 rounded-xl bg-[#0a0f10]" />
        </div>
      </div>
    )
  }

  if (error && !result) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Alert type="error" message={error} onClose={() => setError('')} />
      </div>
    )
  }

  const readiness = result?.readiness || {}
  const scores = readiness.scores || {}
  const primaryGap = readiness.primary_gap
  const actionPlan = readiness.action_plan || []
  const questions = result?.questions || []
  const statusStyle = getStatusStyles(readiness.readiness_status)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 space-y-12">
      
      {/* 1. Header / Report Overview */}
      <header className="space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <Link to="/dashboard" className="text-xs font-medium text-[#8A95A5] hover:text-[#F3F1EA] transition-colors flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2.5">
            <Button size="sm" variant="outline" icon={RefreshCw} onClick={handleReEvaluate} loading={reEvaluating} className="border-white/[0.06] text-[#8A95A5] hover:text-[#F3F1EA]">
              Refresh Analysis
            </Button>
            <Button size="sm" variant="outline" icon={Printer} onClick={handlePrint} className="border-white/[0.06] text-[#8A95A5] hover:text-[#F3F1EA]">
              Print Report
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F3F1EA]">
            AI Interview Readiness Report
          </h1>
          
          {/* Metadata Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#8A95A5]">
            <span className="px-3 py-1 rounded-full bg-[#0a0f10] border border-white/[0.06] capitalize">
              Format: <span className="text-[#F3F1EA] font-semibold ml-1">{result?.interview_type}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#0a0f10] border border-white/[0.06] capitalize">
              Difficulty: <span className="text-[#F3F1EA] font-semibold ml-1">{result?.difficulty}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#0a0f10] border border-white/[0.06]">
              Questions: <span className="text-[#F3F1EA] font-semibold ml-1">{result?.answered_count} / {result?.question_count} Evaluated</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#0a0f10] border border-white/[0.06] capitalize">
              Status: <span className="text-[#F3F1EA] font-semibold ml-1">{result?.status}</span>
            </span>
          </div>
        </div>
      </header>

      {/* 2. Overall Readiness — Hero Score Card */}
      <section className="p-8 md:p-10 rounded-2xl bg-[#0a0f10] border border-white/[0.06] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Radial Score Gauge */}
          <ProgressRing 
            score={readiness.readiness_score || 0} 
            colorClass={statusStyle.text}
          />

          {/* Content & Interpretation */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
                Overall Readiness Score
              </span>
              {readiness.readiness_status && (
                <span className={`inline-block self-center md:self-auto text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${statusStyle.border} ${statusStyle.bg} ${statusStyle.text}`}>
                  {readiness.readiness_status}
                </span>
              )}
            </div>

            <p className="text-base md:text-lg text-[#F3F1EA] leading-relaxed font-normal">
              {readiness.readiness_score >= 80 
                ? "You demonstrate a strong grasp of the required competencies and are well-positioned for this interview level."
                : readiness.readiness_score >= 60
                ? "You have a solid foundation, but targeted improvements in specific areas will significantly increase your success rate."
                : "Significant gaps were identified across core interview benchmarks. Focused preparation is recommended before a live interview."}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Core Dimensions — 4 Metric Cards in 2x2 Grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
          Core Dimensions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(scores).map(([key, val]) => {
            const IconComponent = getDimensionIcon(key)
            return (
              <div 
                key={key} 
                className="p-5 rounded-xl bg-[#0a0f10] border border-white/[0.06] hover:border-[#7C8FB2]/40 transition-all duration-200 space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#151a1e] border border-white/10 flex items-center justify-center text-[#7C8FB2]">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-[#F3F1EA]">{formatAreaName(key)}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-[#F3F1EA]">{val} <span className="text-xs font-normal text-[#8A95A5]">/ 100</span></span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-[#151a1e] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#7C8FB2] group-hover:bg-[#9aaecf] transition-all duration-700 ease-out rounded-full" 
                    style={{ width: `${val}%` }} 
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Primary Readiness Bottleneck — Highlighted Card */}
      {primaryGap && (
        <section className="p-6 md:p-8 rounded-xl bg-[#0a0f10] border border-rose-500/30 shadow-lg relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />

          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400">
              Primary Readiness Bottleneck
            </h2>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-bold text-[#F3F1EA] tracking-tight">{formatAreaName(primaryGap.area)}</h3>
              <span className="text-sm font-mono font-bold text-rose-400">{primaryGap.score} / 100</span>
            </div>
            <p className="text-sm text-[#8A95A5] leading-relaxed max-w-3xl">
              {primaryGap.recommendation || "This area represents your most significant gap compared to expected baselines. Prioritize this in your preparation."}
            </p>
          </div>
        </section>
      )}

      {/* 5. AI Session Summary — Two-Column Card Layout */}
      {(result?.feedback || result?.strengths || result?.weaknesses) && (
        <section className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
            AI Session Summary
          </h2>

          {result.feedback && (
            <div className="p-6 rounded-xl bg-[#0a0f10] border border-white/[0.06] text-sm md:text-base text-[#F3F1EA] leading-relaxed">
              {result.feedback}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.strengths && (
              <div className="p-6 rounded-xl bg-[#0a0f10] border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Key Positives
                </div>
                <p className="text-sm text-[#8A95A5] leading-relaxed whitespace-pre-wrap">
                  {result.strengths}
                </p>
              </div>
            )}

            {result.weaknesses && (
              <div className="p-6 rounded-xl bg-[#0a0f10] border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> Main Deficits
                </div>
                <p className="text-sm text-[#8A95A5] leading-relaxed whitespace-pre-wrap">
                  {result.weaknesses}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. Personalized Action Plan — Timeline with Cards */}
      {actionPlan.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
            Personalized Action Plan
          </h2>

          <div className="relative pl-6 md:pl-8 space-y-4 border-l border-white/[0.08]">
            {actionPlan.map((step, idx) => {
              const isFirst = idx === 0
              const isSecond = idx === 1
              const label = isFirst ? 'Highest Priority' : isSecond ? 'High Priority' : 'Next Step'
              const labelColor = isFirst ? 'text-rose-400' : isSecond ? 'text-amber-400' : 'text-[#7C8FB2]'
              const dotColor = isFirst ? 'border-rose-400 bg-rose-500' : isSecond ? 'border-amber-400 bg-amber-500' : 'border-[#7C8FB2] bg-[#7C8FB2]'

              return (
                <div key={idx} className="relative group">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[calc(1.5rem+5px)] md:-left-[calc(2rem+5px)] top-5 w-2.5 h-2.5 rounded-full border ${dotColor} transition-transform group-hover:scale-125`} />

                  {/* Action card */}
                  <div className="p-5 rounded-xl bg-[#0a0f10] border border-white/[0.06] hover:border-[#7C8FB2]/30 transition-all space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[#8A95A5]">
                        0{idx + 1}
                      </span>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${labelColor}`}>
                        {label}
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-[#F3F1EA] leading-relaxed">
                      {step}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 7. Detailed Evaluation — Accordion Cards */}
      {questions.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
              Detailed Evaluation ({questions.length} Questions)
            </h2>
          </div>
          
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const isExpanded = !!expandedQuestions[idx]
              const score = q.overall_score !== null && q.overall_score !== undefined ? q.overall_score : null
              const displayScore = score !== null ? (score <= 10 ? `${score}/10` : `${score}/100`) : '-'

              return (
                <div 
                  key={idx} 
                  className="rounded-xl border border-white/[0.06] bg-[#0a0f10] hover:border-[#7C8FB2]/30 transition-all overflow-hidden"
                >
                  <button 
                    onClick={() => toggleQuestion(idx)}
                    className="w-full p-5 sm:p-6 flex items-start gap-4 sm:gap-6 text-left cursor-pointer group"
                  >
                    <span className="w-7 h-7 rounded-lg bg-[#151a1e] border border-white/10 text-xs font-mono font-bold text-[#7C8FB2] flex items-center justify-center shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <div className="flex-1 space-y-1 pr-2">
                      <h4 className="text-base font-bold text-[#F3F1EA] leading-snug group-hover:text-white transition-colors">
                        {q.question_text}
                      </h4>
                      {score !== null && (
                        <div className="flex items-center gap-4 text-xs font-mono text-[#8A95A5]">
                          <span>Score: <strong className="text-[#F3F1EA] font-semibold">{displayScore}</strong></span>
                        </div>
                      )}
                    </div>
                    <div className="text-[#8A95A5] group-hover:text-[#F3F1EA] transition-colors shrink-0 mt-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-0 space-y-6 border-t border-white/[0.04] mt-2">
                      
                      {/* Answer */}
                      <div className="pt-4 space-y-2">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8A95A5]">
                          Your Answer
                        </p>
                        <div className="p-4 rounded-lg bg-[#050708] border border-white/[0.06]">
                          <p className="text-sm text-[#F3F1EA] leading-relaxed whitespace-pre-wrap font-mono text-xs opacity-90">
                            {q.answer || <span className="italic text-[#8A95A5]">No answer provided</span>}
                          </p>
                        </div>
                      </div>

                      {/* AI Guidance */}
                      {q.feedback && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7C8FB2] flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5" /> AI Coach Guidance
                          </p>
                          <p className="text-sm text-[#F3F1EA] leading-relaxed bg-[#7C8FB2]/5 p-4 rounded-lg border border-[#7C8FB2]/15">
                            {q.feedback}
                          </p>
                        </div>
                      )}

                      {/* Strengths & Weaknesses */}
                      {(q.strengths || q.weaknesses) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {q.strengths && (
                            <div className="p-4 rounded-lg bg-emerald-500/[0.03] border border-emerald-500/15 space-y-1">
                              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">What You Did Well</p>
                              <p className="text-xs text-[#8A95A5] leading-relaxed">{q.strengths}</p>
                            </div>
                          )}
                          {q.weaknesses && (
                            <div className="p-4 rounded-lg bg-rose-500/[0.03] border border-rose-500/15 space-y-1">
                              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400">Areas to Improve</p>
                              <p className="text-xs text-[#8A95A5] leading-relaxed">{q.weaknesses}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Question Scores */}
                      <div className="flex flex-wrap gap-4 pt-3 border-t border-white/[0.04]">
                        {q.technical_accuracy !== null && (
                          <div className="px-3 py-1.5 rounded bg-[#050708] border border-white/[0.06]">
                            <span className="text-[10px] font-mono text-[#8A95A5] uppercase block">Technical</span>
                            <span className="text-xs font-mono font-bold text-[#F3F1EA]">{q.technical_accuracy}</span>
                          </div>
                        )}
                        {q.relevance !== null && (
                          <div className="px-3 py-1.5 rounded bg-[#050708] border border-white/[0.06]">
                            <span className="text-[10px] font-mono text-[#8A95A5] uppercase block">Relevance</span>
                            <span className="text-xs font-mono font-bold text-[#F3F1EA]">{q.relevance}</span>
                          </div>
                        )}
                        {q.completeness !== null && (
                          <div className="px-3 py-1.5 rounded bg-[#050708] border border-white/[0.06]">
                            <span className="text-[10px] font-mono text-[#8A95A5] uppercase block">Completeness</span>
                            <span className="text-xs font-mono font-bold text-[#F3F1EA]">{q.completeness}</span>
                          </div>
                        )}
                        {q.communication !== null && (
                          <div className="px-3 py-1.5 rounded bg-[#050708] border border-white/[0.06]">
                            <span className="text-[10px] font-mono text-[#8A95A5] uppercase block">Communication</span>
                            <span className="text-xs font-mono font-bold text-[#F3F1EA]">{q.communication}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

    </div>
  )
}

export default ResultsPage
