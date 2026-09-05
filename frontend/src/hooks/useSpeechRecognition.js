import { useState, useEffect, useRef, useCallback } from 'react'

export const useSpeechRecognition = () => {
  const [status, setStatus] = useState('idle') // 'idle' | 'listening' | 'stopped' | 'processing'
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [permissionDenied, setPermissionDenied] = useState(false)

  const recognitionRef = useRef(null)
  const isListeningIntentRef = useRef(false)
  const transcriptRef = useRef('')

  // Keep transcriptRef in sync
  useEffect(() => {
    transcriptRef.current = transcript
  }, [transcript])

  const SpeechRecognition =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)

  const isSupported = Boolean(SpeechRecognition)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isListeningIntentRef.current = false
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }, [])

  const stopListening = useCallback(() => {
    isListeningIntentRef.current = false
    setStatus('processing')

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        setStatus('stopped')
      }
    } else {
      setStatus('stopped')
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Brave.')
      return
    }

    setErrorMessage('')
    setPermissionDenied(false)
    setInterimTranscript('')
    isListeningIntentRef.current = true

    // Initialize or recreate recognition instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // ignore
      }
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setStatus('listening')
    }

    recognition.onresult = (event) => {
      let currentInterim = ''
      let finalChunk = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i]
        const text = item[0]?.transcript || ''
        if (item.isFinal) {
          finalChunk += (finalChunk ? ' ' : '') + text.trim()
        } else {
          currentInterim += (currentInterim ? ' ' : '') + text
        }
      }

      if (finalChunk) {
        setTranscript((prev) => {
          const separator = prev && !prev.endsWith(' ') ? ' ' : ''
          return prev ? `${prev}${separator}${finalChunk}` : finalChunk
        })
      }

      setInterimTranscript(currentInterim)
    }

    recognition.onerror = (event) => {
      console.warn('SpeechRecognition error:', event.error)

      if (event.error === 'not-allowed') {
        isListeningIntentRef.current = false
        setPermissionDenied(true)
        setErrorMessage('Microphone access denied. Please click the camera/mic icon in your address bar and allow microphone permissions.')
        setStatus('idle')
      } else if (event.error === 'audio-capture') {
        isListeningIntentRef.current = false
        setErrorMessage('No microphone detected. Please plug in or enable a microphone and try again.')
        setStatus('idle')
      } else if (event.error === 'network') {
        setErrorMessage('Speech recognition network error. Please verify your connection.')
        setStatus('stopped')
      } else if (event.error === 'no-speech') {
        // Silent timeout from browser recognition; if still intending to listen, will restart in onend
      }
    }

    recognition.onend = () => {
      setInterimTranscript('')

      // If user still wants to listen (e.g. Chrome auto-closed after silence), restart
      if (isListeningIntentRef.current) {
        try {
          recognition.start()
        } catch {
          setStatus('stopped')
          isListeningIntentRef.current = false
        }
      } else {
        setStatus('stopped')
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (err) {
      console.warn('Failed to start recognition:', err)
      setStatus('idle')
    }
  }, [isSupported, SpeechRecognition])

  const resetTranscript = useCallback(() => {
    if (isListeningIntentRef.current) {
      stopListening()
    }
    setTranscript('')
    setInterimTranscript('')
    setStatus('idle')
    setErrorMessage('')
  }, [stopListening])

  const clearError = useCallback(() => {
    setErrorMessage('')
  }, [])

  return {
    isSupported,
    status, // 'idle' | 'listening' | 'stopped' | 'processing'
    transcript,
    interimTranscript,
    errorMessage,
    permissionDenied,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
    clearError,
  }
}

export default useSpeechRecognition
