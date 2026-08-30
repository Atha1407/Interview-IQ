import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resumeService } from '../services/resumeService'
import { getErrorMessage } from '../services/api'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { Skeleton } from '../components/ui/Skeleton'
import {
  FileText,
  UploadCloud,
  Trash2,
  Play,
  Calendar,
  FileCheck,
  Plus,
  ArrowRight,
} from 'lucide-react'

export const ResumePage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await resumeService.listResumes()
      setResumes(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])

  const handleFileUpload = async (file) => {
    if (!file) return

    const ext = file.name.split('.').pop().toLowerCase()
    if (ext !== 'pdf' && ext !== 'docx') {
      setError('Only PDF (.pdf) and Word (.docx) files are supported.')
      return
    }

    try {
      setUploading(true)
      setError('')
      setSuccess('')
      const uploaded = await resumeService.uploadResume(file)
      setResumes((prev) => [uploaded, ...prev])
      setSuccess(`"${file.name}" uploaded successfully. Ready for interview simulations.`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleDelete = async (resumeId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return
    }

    try {
      setDeletingId(resumeId)
      setError('')
      await resumeService.deleteResume(resumeId)
      setResumes((prev) => prev.filter((r) => r.id !== resumeId))
      setSuccess(`"${fileName}" removed.`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative z-10">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F3F1EA]">
            Resume Management
          </h1>
          <p className="text-sm text-[#8A95A5] max-w-xl">
            Upload and manage your resumes to tailor realistic interview simulations.
          </p>
        </div>

        <Link to="/interview/setup" className="shrink-0">
          <Button variant="mint" icon={Play} className="px-5 py-2.5 font-bold text-xs uppercase tracking-wider">
            Start Interview
          </Button>
        </Link>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      {/* 2. Drag & Drop Upload Area (Refined compact dimensions) */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-6 sm:p-8 md:p-9 rounded-2xl bg-[#0a0f10]/80 border-2 border-dashed transition-all duration-200 text-center cursor-pointer group overflow-hidden backdrop-blur-md shadow-xl shadow-black/20 ${
          isDragOver
            ? 'border-[#7C8FB2] bg-[#7C8FB2]/10 scale-[1.005]'
            : 'border-white/10 hover:border-[#7C8FB2]/40 hover:bg-[#0a0f10]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0])
            }
          }}
        />

        <div className="relative z-10 max-w-sm mx-auto space-y-3.5">
          <div className={`w-12 h-12 rounded-xl bg-[#050708] border border-white/10 flex items-center justify-center mx-auto text-[#7C8FB2] transition-all duration-200 ${
            isDragOver ? 'scale-110 border-[#7C8FB2] text-white bg-[#7C8FB2]/20' : 'group-hover:scale-105 group-hover:border-[#7C8FB2]/40'
          }`}>
            <UploadCloud className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#F3F1EA]">
              {uploading ? 'Uploading your resume...' : 'Upload your resume'}
            </h3>
            <p className="text-xs text-[#8A95A5] leading-relaxed">
              Drag & drop your PDF or DOCX here, or browse
            </p>
            <p className="text-[11px] font-mono text-[#8A95A5]/70 pt-0.5">
              PDF and DOCX supported (up to 5MB)
            </p>
          </div>

          <div className="pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={uploading}
              icon={Plus}
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="border-white/10 text-[#8A95A5] hover:text-[#F3F1EA] hover:border-[#7C8FB2]/40 bg-transparent px-4 py-1.5 text-xs"
            >
              Browse Files
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Uploaded Resumes List */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2] flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#7C8FB2]" />
            <span>YOUR RESUMES ({resumes.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 rounded-xl bg-[#0a0f10]" />
            <Skeleton className="h-16 rounded-xl bg-[#0a0f10]" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="p-8 sm:p-10 rounded-xl bg-[#0a0f10]/80 border border-white/[0.06] backdrop-blur-md text-center space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#050708] border border-white/10 flex items-center justify-center mx-auto text-[#8A95A5]">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#F3F1EA]">No Resumes Uploaded</p>
            <p className="text-xs text-[#8A95A5] max-w-xs mx-auto">
              Upload a resume above to start generating tailored interview questions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="p-4 sm:p-5 rounded-xl bg-[#0a0f10]/80 border border-white/[0.08] backdrop-blur-md hover:border-[#7C8FB2]/40 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-lg shadow-black/20"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#050708] border border-white/10 flex items-center justify-center text-[#7C8FB2] shrink-0 group-hover:border-[#7C8FB2]/40 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F3F1EA] group-hover:text-white transition-colors">
                      {resume.file_name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[#8A95A5] mt-1">
                      <span className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-[#8A95A5]/70" />
                        {new Date(resume.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    size="sm"
                    variant="mint"
                    icon={ArrowRight}
                    onClick={() => navigate('/interview/setup', { state: { selectedResumeId: resume.id } })}
                    className="px-4 py-1.5 text-xs font-bold"
                  >
                    Use in Interview
                  </Button>
                  <button
                    onClick={() => handleDelete(resume.id, resume.file_name)}
                    disabled={deletingId === resume.id}
                    className="p-2 rounded-lg text-[#8A95A5] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default ResumePage
