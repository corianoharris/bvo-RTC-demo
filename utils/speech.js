// Browser speech recognition and synthesis

let recognition = null
let speechCallback = null

export const startListening = (callback) => {
  speechCallback = callback

  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    console.error("Speech recognition not supported in this browser")
    return
  }

  // Initialize speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
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
    // Restart listening unless explicitly stopped
    if (recognition && !recognition.stopped) {
      recognition.start()
    }
  }

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error)
    if (event.error === "no-speech") {
      // Restart on no-speech error
      if (recognition && !recognition.stopped) {
        recognition.start()
      }
    }
  }

  recognition.stopped = false
  recognition.start()
}

export const stopListening = () => {
  if (recognition) {
    recognition.stopped = true
    recognition.abort()
    recognition = null
  }
}

export const speak = (text) => {
  if (!("speechSynthesis" in window)) {
    console.error("Speech synthesis not supported in this browser")
    return
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.0
  utterance.pitch = 1.0
  utterance.volume = 1.0

  // Get available voices and select a good one if available
  const voices = window.speechSynthesis.getVoices()

  // Try to find a natural sounding English voice
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

  // If no preferred voice found, try to find any English voice
  if (!utterance.voice) {
    const englishVoice = voices.find((v) => v.lang.startsWith("en-"))
    if (englishVoice) {
      utterance.voice = englishVoice
    }
  }

  window.speechSynthesis.speak(utterance)
}
