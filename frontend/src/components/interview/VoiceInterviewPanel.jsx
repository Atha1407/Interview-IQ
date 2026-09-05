import React, { useEffect, useRef } from 'react'
import {
  Mic,
  Square,
  Volume2,
  VolumeX,
  RotateCcw,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Sparkles,
  MessageSquare,
} from 'lucide-react'
import Button from '../ui/Button'
import Alert from '../ui/Alert'

export const VoiceInterviewPanel = ({
  questionText,
  transcript,
  interimTranscript,
  status, // 'idle' | 'listening' | 'stopped' | 'processing'
  isSpeechSupported,
  errorMessage,
  permissionDenied,
  onStartListening,
  onStopListening,
  onResetTranscript,
  onTranscriptChange,
  onSubmitAnswer,
  submitting,
  isFinalQuestion,
  onSwitchToTextMode,
  // TTS props
  isTTSSupported,
  isSpeaking,
  onSpeakQuestion,
  onCancelTTS,
}) => {
  const textareaRef = useRef(null)

  // When speech recognition starts, make sure TTS is stopped
  const handleStartSpeaking = () => {
    if (isSpeaking) {
      onCancelTTS()
    }
    onStartListening()
  }

  // Auto-focus transcript editing when stopped
  useEffect(() => {
    if (status === 'stopped' && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [status])

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-6">
      {/* 1. Question TTS Bar */}
      <div className="p-4 rounded-xl bg-[#0e1416]/90 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7C8FB2]/15 border border-[#7C8FB2]/25 flex items-center justify-center text-[#7C8FB2] shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7C8FB2] block">
              Voice Assistant
            </span>
            <span className="text-xs text-[#8A95A5]">
              {isSpeaking ? 'Reading question aloud...' : 'Have the interviewer read the question to you.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isTTSSupported ? (
            isSpeaking ? (
              <button
                type="button"
                onClick={onCancelTTS}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-3 bg-rose-400 rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-rose-400 rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-1 h-2 bg-rose-400 rounded-full animate-pulse [animation-delay:300ms]" />
                </div>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Reading</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSpeakQuestion(questionText)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#151a1e] border border-white/10 text-xs font-semibold text-[#F3F1EA] hover:bg-[#1c2227] hover:border-white/20 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#7C8FB2]" />
                <span>Read Question Aloud</span>
              </button>
            )
          ) : (
            <span className="text-xs text-[#8A95A5] italic">Text-to-speech not supported</span>
          )}
        </div>
      </div>

      {/* 2. Browser Compatibility or Permission Warnings */}
      {!isSpeechSupported && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Voice recognition (Web Speech API) is not supported in this browser. For voice features, please use <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, or <strong>Brave</strong>.
            </span>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onSwitchToTextMode}
            icon={MessageSquare}
            className="shrink-0 text-xs"
          >
            Switch to Text Mode
          </Button>
        </div>
      )}

      {permissionDenied && (
        <Alert
          type="error"
          title="Microphone Access Required"
          message="Microphone permission was denied. Please allow microphone access in your browser settings or switch to Text Mode to continue."
        />
      )}

      {errorMessage && !permissionDenied && (
        <Alert
          type="warning"
          message={errorMessage}
        />
      )}

      {/* 3. Hero Microphone Controller */}
      <div className="p-8 rounded-2xl bg-[#0a0f10] border border-white/[0.06] shadow-xl flex flex-col items-center justify-center text-center space-y-6">
        
        {/* Status Indicator Pill */}
        <div className="inline-flex items-center gap-2">
          {status === 'listening' ? (
            <span className="inline-flex items-center gap-2 text-rose-300 bg-rose-500/15 px-3.5 py-1.5 rounded-full border border-rose-500/30 animate-pulse text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-2.5 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-3.5 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-2.5 bg-rose-400 rounded-full animate-bounce" />
              </div>
              Listening... Speak clearly into your mic
            </span>
          ) : status === 'processing' ? (
            <span className="inline-flex items-center gap-1.5 text-amber-300 bg-amber-500/15 px-3.5 py-1.5 rounded-full border border-amber-500/30 text-xs font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              Processing audio stream...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-[#7C8FB2] bg-[#7C8FB2]/10 px-4 py-1.5 rounded-full border border-[#7C8FB2]/30 text-xs sm:text-sm font-medium">
              <Mic className="w-4 h-4 text-[#7C8FB2]" />
              Click the mic and start speaking
            </span>
          )}
        </div>

        {/* Big Interactive Mic Button */}
        <div className="relative">
          {status === 'listening' && (
            <>
              <div className="absolute -inset-3 rounded-full bg-rose-500/20 blur-md animate-ping pointer-events-none" />
              <div className="absolute -inset-1 rounded-full bg-rose-500/30 blur-sm pointer-events-none" />
            </>
          )}

          {status === 'listening' ? (
            <button
              type="button"
              onClick={onStopListening}
              className="relative w-24 h-24 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/30 border-2 border-rose-400 flex flex-col items-center justify-center transition-all duration-200 transform active:scale-95 cursor-pointer group"
              title="Click to stop speaking"
            >
              <Square className="w-8 h-8 fill-current transition-transform group-hover:scale-90" />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Stop</span>
            </button>
          ) : status === 'processing' ? (
            <button
              type="button"
              disabled
              className="relative w-24 h-24 rounded-full bg-[#151a1e] border-2 border-amber-500/40 text-amber-400 shadow-xl flex flex-col items-center justify-center cursor-not-allowed"
            >
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Wait</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!isSpeechSupported || permissionDenied}
              onClick={handleStartSpeaking}
              className="relative w-24 h-24 rounded-full bg-[#7C8FB2] hover:bg-[#6A7B9B] text-[#050708] shadow-xl shadow-[#7C8FB2]/20 border-2 border-[#7C8FB2]/40 flex flex-col items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
              title="Click to start speaking"
            >
              <Mic className="w-8 h-8 transition-transform group-hover:scale-110 text-[#050708]" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider mt-1 text-[#050708]">
                MIC
              </span>
            </button>
          )}
        </div>

        {/* Supporting text under mic button */}
        <p className="text-xs text-[#8A95A5]">
          Your speech will be converted to text in real time.
        </p>

        {/* Secondary controls when stopped */}
        {status === 'stopped' && transcript && (
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onResetTranscript}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-mono text-[#8A95A5] hover:text-[#F3F1EA] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear & Re-record</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Live & Editable Transcript Review Area */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0a0f10] border border-white/[0.06] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono font-bold uppercase tracking-widest text-[#7C8FB2] flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Transcribed Answer</span>
            </label>
            <span className="text-[11px] text-[#8A95A5] hidden sm:inline">
              (Review & edit before submitting)
            </span>
          </div>

          <div className="text-xs text-[#8A95A5] font-mono">
            {wordCount} words &bull; {transcript.length} chars
          </div>
        </div>

        {/* Live speech preview if actively speaking */}
        {status === 'listening' && interimTranscript && (
          <div className="p-3.5 rounded-xl bg-[#0e1416] border border-[#7C8FB2]/30 text-xs text-[#8A95A5] font-mono leading-relaxed animate-pulse flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#7C8FB2] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#F3F1EA] font-semibold">Live speech: </span>
              <span className="text-[#7C8FB2] italic">{interimTranscript}</span>
            </div>
          </div>
        )}

        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={7}
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            disabled={status === 'listening'}
            placeholder={
              status === 'listening'
                ? 'Your speech is being transcribed here in real time...'
                : 'Your transcribed answer will appear here. You can also edit the text to fix any misheard words before submitting...'
            }
            className={`w-full p-4 bg-[#050708] border border-white/[0.06] rounded-xl text-sm text-[#F3F1EA] placeholder-[#6B7280] focus:outline-none focus:border-[#7C8FB2]/60 focus:ring-1 focus:ring-[#7C8FB2]/60 transition-all font-mono leading-relaxed resize-y ${
              status === 'listening' ? 'opacity-85' : ''
            }`}
          />
        </div>

        {/* Actions & Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-[#8A95A5] flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>You can refine or retype any part of your answer at any time.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="mint"
              size="lg"
              loading={submitting}
              disabled={!transcript.trim() || submitting || status === 'listening'}
              onClick={onSubmitAnswer}
              icon={Send}
              className="w-full sm:w-auto px-8 font-bold"
            >
              {isFinalQuestion ? 'Submit & Finalize Interview' : 'Submit Answer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceInterviewPanel
