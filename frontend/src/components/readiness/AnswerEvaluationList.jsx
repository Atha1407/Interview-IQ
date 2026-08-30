import React, { useState } from 'react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import {
  ChevronDown,
  ChevronUp,
  MessageSquareText,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react'

export const AnswerEvaluationList = ({ questions = [] }) => {
  const [expandedIndices, setExpandedIndices] = useState(
    questions.reduce((acc, _, i) => ({ ...acc, [i]: true }), {})
  )

  const toggleExpand = (index) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-400">No questions found for this interview session.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquareText className="w-5 h-5 text-indigo-400" />
          <span>Question-by-Question Evaluation ({questions.length})</span>
        </h3>
        <button
          onClick={() => {
            const allExpanded = Object.values(expandedIndices).every(Boolean)
            const nextState = questions.reduce(
              (acc, _, i) => ({ ...acc, [i]: !allExpanded }),
              {}
            )
            setExpandedIndices(nextState)
          }}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {Object.values(expandedIndices).every(Boolean) ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isExpanded = !!expandedIndices[idx]
          const score = q.overall_score !== null && q.overall_score !== undefined ? q.overall_score : null

          let scoreBadge = null
          if (score !== null) {
            // If backend stored it as 0-10 or 0-100
            const displayScore = score <= 10 ? `${score}/10` : `${score}/100`
            const variant = score >= 8 || score >= 80 ? 'Ready' : score >= 7 || score >= 70 ? 'Needs Improvement' : 'Not Ready'
            scoreBadge = (
              <Badge size="sm" variant={variant}>
                Score: {displayScore}
              </Badge>
            )
          }

          return (
            <Card
              key={q.question_id || idx}
              className="border-slate-800/80 p-0 overflow-hidden transition-all duration-200"
            >
              {/* Question header row */}
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    Q{idx + 1}
                  </span>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-base font-semibold text-white leading-snug">
                      {q.question_text}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {scoreBadge}
                  <div className="text-slate-400 hover:text-white p-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Collapsible details */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-slate-800/70 space-y-5 bg-slate-950/40">
                  {/* Candidate Answer */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Your Answer
                    </span>
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                      {q.answer || <span className="text-slate-500 italic">No answer provided</span>}
                    </div>
                  </div>

                  {/* Dimension Scores if available */}
                  {(q.technical_accuracy !== null ||
                    q.relevance !== null ||
                    q.completeness !== null ||
                    q.communication !== null) && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Dimension Scores
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {q.technical_accuracy !== null && (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-center">
                            <span className="text-[11px] text-slate-400 block">Technical</span>
                            <span className="text-sm font-bold text-indigo-300">
                              {q.technical_accuracy}
                            </span>
                          </div>
                        )}
                        {q.relevance !== null && (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-center">
                            <span className="text-[11px] text-slate-400 block">Relevance</span>
                            <span className="text-sm font-bold text-indigo-300">
                              {q.relevance}
                            </span>
                          </div>
                        )}
                        {q.completeness !== null && (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-center">
                            <span className="text-[11px] text-slate-400 block">Completeness</span>
                            <span className="text-sm font-bold text-indigo-300">
                              {q.completeness}
                            </span>
                          </div>
                        )}
                        {q.communication !== null && (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-center">
                            <span className="text-[11px] text-slate-400 block">Communication</span>
                            <span className="text-sm font-bold text-indigo-300">
                              {q.communication}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Feedback Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    {q.strengths && (
                      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>What You Did Well</span>
                        </div>
                        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                          {q.strengths}
                        </p>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {q.weaknesses && (
                      <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Areas to Improve</span>
                        </div>
                        <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
                          {q.weaknesses}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Specific Actionable Feedback */}
                  {q.feedback && (
                    <div className="p-4 rounded-xl bg-indigo-950/25 border border-indigo-500/25 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>AI Coach Guidance</span>
                      </div>
                      <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                        {q.feedback}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default AnswerEvaluationList
