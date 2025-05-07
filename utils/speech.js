// Browser speech recognition and synthesis

let recognition = null
let speechCallback = null
let isListening = false
let isStarting = false

export const startListening = (callback) => {
  speechCallback = callback

  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    console.error("Speech recognition not supported in this browser")
    return
  }

  if (isStarting || isListening) {
    console.warn("Speech recognition is already active or starting")
    return
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (recognition) {
    stopListening()
  }
  recognition = new SpeechRecognition()

  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = "en-US"

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    if (speechCallback) {
      speechCallback(transcript)
    }
  }

  recognition.onend = () => {
    if (isListening && recognition && !recognition.stopped) {
      if (!isStarting) {
        recognition.start()
      }
    } else {
      recognition = null
      isListening = false
      isStarting = false
    }
  }

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error)
    if (event.error === "no-speech" && isListening && !recognition.stopped) {
      if (!isStarting) {
        recognition.start()
      }
    } else {
      recognition = null
      isListening = false
      isStarting = false
    }
  }

  recognition.onstart = () => {
    isStarting = false
    isListening = true
  }

  recognition.stopped = false
  isStarting = true
  recognition.start()
}

export const stopListening = () => {
  if (recognition) {
    recognition.stopped = true
    isListening = false
    isStarting = false
    recognition.abort()
    recognition = null
  }
}

export const speak = (text) => {
  if (!("speechSynthesis" in window)) {
    console.error("Speech synthesis not supported in this browser")
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.0
  utterance.pitch = 1.0
  utterance.volume = 1.0

  const voices = window.speechSynthesis.getVoices()

  const preferredVoices = [
    "Google UK English Female",
    "Microsoft Libby Online (Natural)",
    "Microsoft David Online (Natural)",
    "Samantha",
    "Alex",
  ]

  for (const preferredVoice of preferredVoices) {
    const voice = voices.find((v) => v.name === preferredVoice)
    if (voice) {
      utterance.voice = voice
      break
    }
  }

  if (!utterance.voice) {
    const englishVoice = voices.find((v) => v.lang.startsWith("en-"))
    if (englishVoice) {
      utterance.voice = englishVoice
    }
  }

  window.speechSynthesis.speak(utterance)
}