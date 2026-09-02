import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { resumeService } from '../services/resumeService'
import { interviewService } from '../services/interviewService'
import { getErrorMessage } from '../services/api'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { Skeleton } from '../components/ui/Skeleton'
import {
  Play,
  FileText,
  Zap,
  Shield,
  MessageSquare,
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react'

export const InterviewSetupPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const preselectedResumeId = location.state?.selectedResumeId

  const [resumes, setResumes] = useState([])
  const [selectedResumeId, setSelectedResumeId] = useState(preselectedResumeId || '')
  const [interviewType, setInterviewType] = useState('technical')
  const [difficulty, setDifficulty] = useState('medium')
  const [questionCount, setQuestionCount] = useState(5)
  const [topics, setTopics] = useState(['Python', 'Data Structures & Algorithms'])
  const [customTopic, setCustomTopic] = useState('')

  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await resumeService.listResumes()
      setResumes(data)
      if (data.length > 0 && !selectedResumeId) {
        setSelectedResumeId(data[0].id)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [selectedResumeId])

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])

  // Update topics when a resume is selected or loaded (for technical interview)
  useEffect(() => {
    if (interviewType === 'technical') {
      const resume = resumes.find((r) => r.id === selectedResumeId)
      if (resume) {
        if (resume.extracted_topics && resume.extracted_topics.length > 0) {
          setTopics(resume.extracted_topics.slice(0, 10)) // Max 10 topics
        } else {
          setTopics(['Python', 'Data Structures & Algorithms'])
        }
      } else {
        setTopics(['Python', 'Data Structures & Algorithms'])
      }
    }
  }, [selectedResumeId, resumes, interviewType])

  // Reset topics to empty array when switching to behavioral or hr
useEffect(() => {
  if (interviewType === 'behavioral') {
    setTopics(['Teamwork', 'Communication'])
  } else if (interviewType === 'hr') {
    setTopics(['Self Introduction', 'Career Goals'])
  }
}, [interviewType])

  const getPresets = () => {
    if (interviewType === 'behavioral') {
      return [
        'Teamwork', 'Leadership', 'Communication', 'Conflict Resolution',
        'Problem Solving', 'Adaptability', 'Time Management', 'Decision Making'
      ]
    }
    if (interviewType === 'hr') {
      return [
        'Self Introduction', 'Strengths & Weaknesses', 'Career Goals', 'Motivation',
        'Company Fit', 'Work Experience', 'Situational Questions', 'Career Plans'
      ]
    }
    const resume = resumes.find((r) => r.id === selectedResumeId)
    if (resume && resume.extracted_topics && resume.extracted_topics.length > 0) {
      return resume.extracted_topics
    }
    return [
      'Python', 'FastAPI', 'Data Structures & Algorithms', 'System Design',
      'SQL & Databases', 'REST APIs', 'React & Frontend', 'Cloud & Microservices',
      'Object Oriented Programming', 'Behavioral & Leadership'
    ]
  }

  const currentPresets = getPresets()

  const toggleTopic = (topic) => {
    if (topics.includes(topic)) {
      if (topics.length === 1) {
        setError('At least one topic is required.')
        return
      }
      setTopics(topics.filter((t) => t !== topic))
    } else {
      if (topics.length >= 10) {
        setError('A maximum of 10 topics can be selected.')
        return
      }
      setTopics([...topics, topic])
    }
  }

  const addCustomTopic = (e) => {
    e.preventDefault()
    const trimmed = customTopic.trim()
    if (!trimmed) return
    if (topics.includes(trimmed)) {
      setCustomTopic('')
      return
    }
    if (topics.length >= 10) {
      setError('A maximum of 10 topics can be selected.')
      return
    }
    setTopics([...topics, trimmed])
    setCustomTopic('')
  }

  const removeTopic = (topicToRemove) => {
    if (topics.length === 1) {
      setError('At least one topic is required.')
      return
    }
    setTopics(topics.filter((t) => t !== topicToRemove))
  }

  const handleStartInterview = async () => {
    setError('')

    if (!selectedResumeId) {
      setError('Please select or upload a resume to proceed.')
      return
    }
    if (topics.length === 0) {
      setError('Please specify at least one topic.')
      return
    }

    try {
      setStarting(true)
      const session = await interviewService.createSession({
        resume_id: selectedResumeId,
        interview_type: interviewType,
        difficulty,
        question_count: Number(questionCount),
        topics,
      })
      await interviewService.generateQuestions(session.id)
      await interviewService.startSession(session.id)
      navigate(`/interview/${session.id}`)
    } catch (err) {
      setError(getErrorMessage(err))
      setStarting(false)
    }
  }

  const selectedResume = resumes.find((r) => r.id === selectedResumeId)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.06]">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#F3F1EA] mb-2">
          Configure Interview
        </h1>
        <p className="text-sm text-[#8A95A5]">
          Customize your session parameters to simulate a targeted interview scenario.
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-40 rounded-xl bg-[#0a0f10]" />
            <Skeleton className="h-40 rounded-xl bg-[#0a0f10]" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-xl bg-[#0a0f10]" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Cols: Step-by-Step Config */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* 1. Resume Selection */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
                  1. Resume Context
                </h2>
                {resumes.length > 0 && (
                  <Link to="/resume" className="text-xs text-[#7C8FB2] hover:text-[#9aaecf] flex items-center gap-1 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Upload new
                  </Link>
                )}
              </div>

              {resumes.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#0a0f10] border border-white/[0.06] text-center space-y-3">
                  <p className="text-sm font-semibold text-[#F3F1EA]">No resume uploaded</p>
                  <p className="text-xs text-[#8A95A5]">Upload a resume to personalize question generation.</p>
                  <Link to="/resume" className="inline-block pt-2">
                    <Button size="sm" variant="mint" icon={Plus}>
                      Upload Resume
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {resumes.map((resume) => {
                    const isSelected = selectedResumeId === resume.id
                    return (
                      <div
                        key={resume.id}
                        onClick={() => setSelectedResumeId(resume.id)}
                        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#7C8FB2]/10 border-[#7C8FB2]/40 text-[#F3F1EA]'
                            : 'bg-[#0a0f10] border-white/[0.06] text-[#8A95A5] hover:border-[#7C8FB2]/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className={`w-4 h-4 ${isSelected ? 'text-[#7C8FB2]' : 'text-[#8A95A5]'}`} />
                          <span className="text-sm font-semibold">{resume.file_name}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#7C8FB2]" />}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* 2. Interview Type */}
            <section className="space-y-4">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
                2. Interview Format
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    id: 'technical',
                    label: 'Technical',
                    desc: 'Coding concepts, system architecture, and CS fundamentals',
                    icon: Zap,
                  },
                  {
                    id: 'behavioral',
                    label: 'Behavioral',
                    desc: 'STAR responses, leadership, and team communication',
                    icon: Shield,
                  },
                  {
                    id: 'hr',
                    label: 'HR / Culture',
                    desc: 'Career trajectory, motivation, and situational scenarios',
                    icon: MessageSquare,
                  },
                ].map((type) => {
                  const Icon = type.icon
                  const isSelected = interviewType === type.id
                  return (
                    <div
                      key={type.id}
                      onClick={() => setInterviewType(type.id)}
                      className={`p-5 rounded-xl border flex flex-col justify-between gap-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#7C8FB2]/10 border-[#7C8FB2]/40'
                          : 'bg-[#0a0f10] border-white/[0.06] hover:border-[#7C8FB2]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#7C8FB2]/20' : 'bg-[#151a1e]'}`}>
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#7C8FB2]' : 'text-[#8A95A5]'}`} />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#7C8FB2]" />}
                      </div>
                      <div>
                        <h3 className={`text-sm font-bold mb-1.5 ${isSelected ? 'text-[#F3F1EA]' : 'text-[#8A95A5]'}`}>{type.label}</h3>
                        <p className="text-xs text-[#8A95A5] leading-relaxed">{type.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* 3. Difficulty & Questions */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
                  3. Difficulty Level
                </h2>
                <div className="flex p-1.5 rounded-xl bg-[#0a0f10] border border-white/[0.06]">
                  {[
                    { id: 'easy', activeClass: 'bg-white/10 text-[#F3F1EA] shadow-sm' },
                    { id: 'medium', activeClass: 'bg-amber-500/15 text-amber-300 border border-amber-500/20 shadow-sm' },
                    { id: 'hard', activeClass: 'bg-rose-500/15 text-rose-300 border border-rose-500/20 shadow-sm' },
                  ].map(({ id, activeClass }) => {
                    const isSelected = difficulty === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setDifficulty(id)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                          isSelected ? activeClass : 'text-[#8A95A5] hover:text-[#F3F1EA]'
                        }`}
                      >
                        {id}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
                    4. Questions
                  </h2>
                  <span className="text-sm font-mono font-bold text-[#7C8FB2]">{questionCount}</span>
                </div>
                <div className="pt-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#151a1e] rounded appearance-none cursor-pointer accent-[#7C8FB2]"
                  />
                  <div className="flex justify-between text-xs text-[#8A95A5] mt-2 font-mono">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Focus Topics */}
            <section className="space-y-4">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2]">
                5. Focus Topics
              </h2>

              <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-[#0a0f10] border border-white/[0.06] min-h-[4rem] items-center">
                {topics.length === 0 && (
                  <span className="text-sm text-[#8A95A5]">No topics selected</span>
                )}
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#7C8FB2]/15 text-[#F3F1EA] border border-[#7C8FB2]/30"
                  >
                    <span>{topic}</span>
                    <button
                      type="button"
                      onClick={() => removeTopic(topic)}
                      className="text-[#8A95A5] hover:text-[#F3F1EA] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={addCustomTopic} className="flex gap-3">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Add custom topic (e.g. Docker, GraphQL)..."
                  className="flex-1 px-4 py-2 bg-[#0a0f10] border border-white/[0.06] rounded-xl text-sm text-[#F3F1EA] placeholder-[#8A95A5] focus:outline-none focus:border-[#7C8FB2]/40 transition-colors"
                />
                <Button type="submit" size="sm" variant="outline" icon={Plus}>
                  Add
                </Button>
              </form>

              <div className="pt-2">
                <span className="text-xs text-[#8A95A5] block mb-3 font-mono">
                  Preset Suggestions:
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentPresets.map((preset) => {
                    const isSelected = topics.includes(preset)
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => toggleTopic(preset)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#7C8FB2]/15 text-[#F3F1EA] border-[#7C8FB2]/30 font-semibold'
                            : 'bg-transparent text-[#8A95A5] border-white/[0.06] hover:border-[#7C8FB2]/30 hover:text-[#F3F1EA]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {preset}
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>

          </div>

          {/* Right Column: Interview Summary */}
          <div>
            <div className="sticky top-24 p-6 sm:p-8 rounded-2xl bg-[#0a0f10] border border-white/[0.06] space-y-8 shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-[#F3F1EA]">Interview Summary</h3>
                <p className="text-xs text-[#8A95A5] mt-1">Live configuration preview</p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                  <span className="text-[#8A95A5]">Format</span>
                  <span className="font-semibold text-[#F3F1EA] capitalize">{interviewType}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                  <span className="text-[#8A95A5]">Level</span>
                  <span className="font-semibold text-[#F3F1EA] capitalize">{difficulty}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                  <span className="text-[#8A95A5]">Length</span>
                  <span className="font-semibold text-[#F3F1EA]">{questionCount} Questions</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                  <span className="text-[#8A95A5]">Resume</span>
                  <span className="font-semibold text-[#F3F1EA] truncate max-w-[140px]" title={selectedResume?.file_name}>
                    {selectedResume?.file_name || 'None selected'}
                  </span>
                </div>
                <div className="pt-2">
                  <span className="text-[#8A95A5] block mb-2.5">Topics ({topics.length})</span>
                  <div className="flex flex-wrap gap-1.5">
                    {topics.map((t, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-[#151a1e] text-[#8A95A5] font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {!selectedResumeId && resumes.length > 0 && (
                <p className="text-xs text-amber-400 text-center bg-amber-500/10 py-2 rounded-lg border border-amber-500/20">
                  Select a resume to enable interview creation.
                </p>
              )}

              <Button
                variant="mint"
                size="lg"
                loading={starting}
                icon={Play}
                disabled={!selectedResumeId || topics.length === 0}
                onClick={handleStartInterview}
                className="w-full font-bold py-3.5 shadow-lg"
              >
                {starting ? 'Preparing Session...' : 'Start Interview'}
              </Button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default InterviewSetupPage
