import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { interviewService } from '../services/interviewService'
import { resumeService } from '../services/resumeService'
import { getErrorMessage } from '../services/api'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import ScoreRing from '../components/ui/ScoreRing'
import Alert from '../components/ui/Alert'
import { Skeleton } from '../components/ui/Skeleton'
import {
  Play,
  FileText,
  Target,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Calendar,
  BarChart2
} from 'lucide-react'

const formatAreaName = (name = '') => {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState([])
  const [resumes, setResumes] = useState([])
  const [latestResult, setLatestResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [sessionsData, resumesData] = await Promise.all([
        interviewService.listSessions(),
        resumeService.listResumes(),
      ])

      // Sort descending by created_at (NEWEST FIRST)
      const sortedSessions = [...sessionsData].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      setSessions(sortedSessions)
      setResumes(resumesData)

      const latestCompleted = sortedSessions.find((s) => s.status === 'completed')
      if (latestCompleted) {
        try {
          const resultData = await interviewService.getResult(latestCompleted.id)
          setLatestResult(resultData)
        } catch {
          // If result not evaluated yet, handle gracefully
        }
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this interview session?')) {
      return
    }

    try {
      setDeletingId(sessionId)
      await interviewService.deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (latestResult?.session_id === sessionId) {
        setLatestResult(null)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  const completedCount = sessions.filter((s) => s.status === 'completed').length

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F1EA] tracking-tight mb-1.5">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Candidate'}
          </h1>
          <p className="text-sm text-[#8A95A5]">
            Track your interview readiness and see what to work on next.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/resume">
            <Button variant="outline" icon={FileText} className="border-[#8A95A5]/20 text-[#8A95A5] hover:text-[#F3F1EA] hover:border-[#8A95A5]/40 transition-colors">
              Resumes ({resumes.length})
            </Button>
          </Link>
          <Link to="/interview/setup">
            <Button variant="mint" icon={Play}>
              Start Interview
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-xl bg-[#0a0f10]" />
          <Skeleton className="h-48 rounded-xl bg-[#0a0f10]" />
          <Skeleton className="h-48 rounded-xl bg-[#0a0f10]" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Top Row: Readiness Overview & Bottleneck */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Latest Readiness Overview */}
            <div className="lg:col-span-2 flex flex-col p-6 sm:p-8 rounded-xl bg-[#0a0f10] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-[#F3F1EA] flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#7C8FB2]" />
                  Latest Assessment
                </h2>
                {latestResult && (
                  <span className="text-xs font-mono text-[#8A95A5] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(latestResult.created_at || Date.now()).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>

              {latestResult?.readiness ? (
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="shrink-0">
                    <ScoreRing
                      score={latestResult.readiness.readiness_score}
                      max={100}
                      size={140}
                      strokeWidth={10}
                      sublabel={latestResult.readiness.readiness_status}
                      label=""
                    />
                  </div>
                  <div className="space-y-4 text-center sm:text-left">
                    <div>
                      <div className="mb-2">
                        <Badge variant={latestResult.readiness.readiness_status}>
                          {latestResult.readiness.readiness_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#8A95A5] leading-relaxed max-w-md">
                        Based on your most recent performance, your readiness is evaluated across technical, communication, and behavioral dimensions.
                      </p>
                    </div>
                    <Link
                      to={`/results/${latestResult.session_id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7C8FB2] hover:text-[#9aaecf] transition-colors"
                    >
                      <span>View full report</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                  <p className="text-sm font-semibold text-[#F3F1EA] mb-2">Your readiness score will appear here</p>
                  <p className="text-xs text-[#8A95A5] mb-6 max-w-sm">
                    Complete your first interview to get your baseline assessment.
                  </p>
                  <Link to="/interview/setup">
                    <Button size="sm" variant="mint" icon={Play}>
                      Start Interview
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Primary Bottleneck */}
            <div className="flex flex-col p-6 rounded-xl bg-[#0a0f10] border border-white/[0.06]">
              <h2 className="text-base font-bold text-[#F3F1EA] flex items-center gap-2 mb-6">
                <AlertTriangle className="w-4 h-4 text-amber-500/80" />
                Primary Bottleneck
              </h2>

              {latestResult?.readiness?.primary_gap ? (
                <div className="flex-1 flex flex-col">
                  <div className="mb-4">
                    <span className="text-lg font-bold text-[#F3F1EA]">
                      {formatAreaName(latestResult.readiness.primary_gap.area)}
                    </span>
                    <div className="mt-2 text-xs font-mono text-amber-500/90 bg-amber-500/10 inline-block px-2 py-0.5 rounded border border-amber-500/20">
                      Score: {latestResult.readiness.primary_gap.score}/100
                    </div>
                  </div>
                  <p className="text-sm text-[#8A95A5] leading-relaxed mb-6">
                    {latestResult.readiness.primary_gap.recommendation ||
                      'This was identified as your primary gap across technical responses.'}
                  </p>
                  <div className="mt-auto pt-4 border-t border-white/[0.06]">
                    <Link
                      to={`/results/${latestResult.session_id}`}
                      className="text-xs font-semibold text-[#7C8FB2] hover:text-[#9aaecf] flex items-center gap-1 transition-colors"
                    >
                      <span>See action plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <p className="text-xs text-[#8A95A5] leading-relaxed px-4">
                    Complete an interview to identify your primary area to improve.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Metrics (Minimal) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/[0.06]">
            <div>
              <p className="text-xs font-medium text-[#8A95A5] mb-1">Completed Interviews</p>
              <p className="text-3xl font-bold text-[#F3F1EA]">{completedCount}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#8A95A5] mb-1">Total Sessions</p>
              <p className="text-3xl font-bold text-[#F3F1EA]">{sessions.length}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#8A95A5] mb-1">Uploaded Resumes</p>
              <p className="text-3xl font-bold text-[#F3F1EA]">{resumes.length}</p>
            </div>
          </div>

          {/* Recent Interview Sessions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#F3F1EA]">Recent Sessions</h3>
            </div>

            {sessions.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[#0a0f10] border border-white/[0.06]">
                <p className="text-sm font-semibold text-[#F3F1EA] mb-2">Your interview history will appear here</p>
                <p className="text-xs text-[#8A95A5] mb-6">
                  Start your first interview to begin tracking your progress.
                </p>
                <Link to="/interview/setup">
                  <Button size="sm" variant="mint" icon={Play}>
                    Start Interview
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => {
                  const isCompleted = session.status === 'completed'
                  const isInProgress = session.status === 'in_progress'

                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                         if (isCompleted) {
                           navigate(`/results/${session.id}`)
                         } else {
                           navigate(`/interview/${session.id}`)
                         }
                      }}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#0a0f10] border border-transparent hover:border-[#7C8FB2]/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${isCompleted ? 'bg-[#7C8FB2]/10 border-[#7C8FB2]/20 text-[#7C8FB2]' : 'bg-[#1a1f24] border-white/10 text-[#8A95A5]'}`}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-[#F3F1EA] capitalize">
                              {session.interview_type} Interview
                            </span>
                            <Badge variant={session.difficulty} size="sm">
                              {session.difficulty}
                            </Badge>
                            {!isCompleted && (
                              <Badge variant={session.status} size="sm">
                                {session.status}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-[#8A95A5] font-mono">
                            {new Date(session.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })} · {session.question_count} Questions
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0 sm:ml-auto">
                        <button
                          onClick={(e) => handleDeleteSession(e, session.id)}
                          disabled={deletingId === session.id}
                          className="p-2 rounded text-[#8A95A5] hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isCompleted ? (
                           <div className="flex items-center gap-1.5 text-sm font-semibold text-[#7C8FB2]">
                             Review <ArrowRight className="w-4 h-4" />
                           </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#F3F1EA]">
                             {isInProgress ? 'Resume' : 'Start'} <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
