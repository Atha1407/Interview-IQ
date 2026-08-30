import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { interviewService } from '../services/interviewService'
import { getErrorMessage } from '../services/api'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { Skeleton } from '../components/ui/Skeleton'
import {
  Brain,
  Send,
  Sparkles,
  Loader2,
  CornerDownLeft,
} from 'lucide-react'

export const InterviewPage = () => {
  const { id: sessionId } = useParams()
  const navigate = useNavigate()
  const textareaRef = useRef(null)

  const [session, setSession] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answerText, setAnswerText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState('')

  const loadInterview = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const sessionData = await interviewService.getSession(sessionId)
      setSession(sessionData)

      if (sessionData.status === 'completed') {
        navigate(`/results/${sessionId}`, { replace: true })
        return
      }

      let questionsData = await interviewService.getSessionQuestions(sessionId)

      if (!questionsData || questionsData.length === 0) {
        questionsData = await interviewService.generateQuestions(sessionId)
      }

      if (sessionData.status === 'created') {
        await interviewService.startSession(sessionId)
      }

      setQuestions(questionsData)

      const targetIndex = Math.max(0, (sessionData.current_question || 1) - 1)
      setCurrentQuestionIndex(targetIndex)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [sessionId, navigate])

  useEffect(() => {
    loadInterview()
  }, [loadInterview])

  const handleSubmitAnswer = async (e) => {
    if (e) e.preventDefault()
    if (!answerText.trim() || submitting || evaluating) return

    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    try {
      setSubmitting(true)
      setError('')

      const response = await interviewService.submitAnswer(
        sessionId,
        currentQuestion.id,
        answerText.trim()
      )

      if (response.status === 'completed') {
        setEvaluating(true)
        setTimeout(() => {
          navigate(`/results/${sessionId}`, { replace: true })
        }, 1200)
      } else {
        setAnswerText('')
        setCurrentQuestionIndex((prev) => prev + 1)
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  const activeQuestion = questions[currentQuestionIndex]
  const totalQuestions = session?.question_count || questions.length || 1
  const currentNumber = currentQuestionIndex + 1
  const progressPercent = Math.min(100, Math.round((currentNumber / totalQuestions) * 100))
  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <Skeleton className="h-10 w-1/3 rounded-xl bg-[#0a0f10]" />
        <Skeleton className="h-48 rounded-2xl bg-[#0a0f10]" />
        <Skeleton className="h-64 rounded-2xl bg-[#0a0f10]" />
      </div>
    )
  }

  if (evaluating) {
    return (
      <div className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center px-4 text-center space-y-6">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-2xl bg-[#7C8FB2]/15 border border-[#7C8FB2]/25 flex items-center justify-center text-[#7C8FB2] animate-pulse">
            <Brain className="w-8 h-8" />
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-[#7C8FB2] absolute -top-1.5 -right-1.5" />
        </div>

        <div className="space-y-2 max-w-sm">
          <h2 className="text-2xl font-bold text-[#F3F1EA] tracking-tight">
            Analyzing your interview
          </h2>
          <p className="text-sm text-[#8A95A5] leading-relaxed">
            AI is evaluating technical accuracy, relevance, completeness, and communication.
            Your readiness report will be ready in moments.
          </p>
        </div>

        <div className="flex gap-1.5 pt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#7C8FB2] animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Top Header & Progress */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
              Live Simulation
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0a0f10] border border-white/[0.06] text-xs text-[#8A95A5] capitalize">
              {session?.interview_type}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0a0f10] border border-white/[0.06] text-xs text-[#8A95A5] capitalize">
              {session?.difficulty}
            </span>
          </div>

          <span className="text-sm font-semibold text-[#8A95A5]">
            Question <span className="text-[#F3F1EA] font-bold">{currentNumber}</span> of {totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#7C8FB2] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Progress dots */}
        {totalQuestions <= 10 && (
          <div className="flex gap-1.5 items-center">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={`progress-dot ${
                  i < currentQuestionIndex
                    ? 'completed'
                    : i === currentQuestionIndex
                    ? 'active'
                    : ''
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Active Question Box */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0a0f10] border border-white/[0.06] space-y-4 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7C8FB2]">
            <Sparkles className="w-4 h-4 text-[#7C8FB2]" />
            <span>Topic: <strong className="text-[#F3F1EA] font-mono">{activeQuestion?.topic || 'General'}</strong></span>
          </div>

          <span className="px-2.5 py-0.5 rounded-md bg-[#151a1e] border border-white/10 text-xs text-[#8A95A5] uppercase font-mono">
            {activeQuestion?.difficulty}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#F3F1EA] leading-relaxed">
          {activeQuestion?.question_text || 'Explain an important technical concept.'}
        </h2>
      </div>

      {/* Candidate Response Area */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0a0f10] border border-white/[0.06] space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
            Your Response
          </label>
          <div className="text-xs text-[#8A95A5] font-mono">
            {wordCount} words &bull; {answerText.length} chars
          </div>
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={8}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your structured answer here. Include relevant principles, trade-offs, architecture decisions, or code logic where appropriate..."
            className="w-full p-4 bg-[#050708] border border-white/[0.06] rounded-xl text-sm text-[#F3F1EA] placeholder-[#6B7280] focus:outline-none focus:border-[#7C8FB2]/60 focus:ring-1 focus:ring-[#7C8FB2]/60 transition-all font-mono leading-relaxed resize-y"
            autoFocus
          />
        </div>

        {/* Footer controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-[#8A95A5] flex items-center gap-1.5 font-mono">
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span>Tip: Press <strong>Ctrl + Enter</strong> to submit your answer</span>
          </div>

          <Button
            variant="mint"
            size="lg"
            loading={submitting}
            disabled={!answerText.trim() || submitting}
            onClick={handleSubmitAnswer}
            icon={Send}
            className="w-full sm:w-auto px-8 font-bold"
          >
            {currentNumber >= totalQuestions ? 'Submit & Finalize Interview' : 'Submit Answer'}
          </Button>
        </div>
      </div>

    </div>
  )
}

export default InterviewPage
