import { useState, useEffect, useRef, useCallback } from 'react'

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [voices, setVoices] = useState([])
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

  const activeUtteranceRef = useRef(null)

  // Load available system voices
  useEffect(() => {
    if (!isSupported) return

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      if (availableVoices.length > 0) {
        setVoices(availableVoices)
      }
    }

    loadVoices()
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isSupported])

  const cancel = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
    activeUtteranceRef.current = null
  }, [isSupported])

  const speak = useCallback((text, onEnd) => {
    if (!isSupported || !text || !text.trim()) return

    // Cancel any active utterance
    cancel()

    try {
      const utterance = new SpeechSynthesisUtterance(text.trim())
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.lang = 'en-US'

      // Select high-quality natural voice if available
      if (voices.length > 0) {
        const preferredVoice =
          voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Guy'))) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0]

        if (preferredVoice) {
          utterance.voice = preferredVoice
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        setIsPaused(false)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        setIsPaused(false)
        activeUtteranceRef.current = null
        if (onEnd) onEnd()
      }

      utterance.onerror = (event) => {
        // Ignore errors triggered by intentional cancellation
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          console.warn('SpeechSynthesis error:', event.error)
        }
        setIsSpeaking(false)
        setIsPaused(false)
        activeUtteranceRef.current = null
      }

      utterance.onpause = () => {
        setIsPaused(true)
      }

      utterance.onresume = () => {
        setIsPaused(false)
      }

      activeUtteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('Failed to start speech synthesis:', err)
      setIsSpeaking(false)
      setIsPaused(false)
    }
  }, [isSupported, voices, cancel])

  const pause = useCallback(() => {
    if (!isSupported || !isSpeaking) return
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [isSupported, isSpeaking])

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return
    window.speechSynthesis.resume()
    setIsPaused(false)
  }, [isSupported, isPaused])

  return {
    isSupported,
    isSpeaking,
    isPaused,
    speak,
    cancel,
    pause,
    resume,
  }
}

export default useSpeechSynthesis
