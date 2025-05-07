"use client"

import { useEffect, useState, useRef } from "react"
import Message from "@/components/Message"
import { startListening, stopListening, speak } from "@/utils/speech"
import { getAIResponse } from "@/utils/ai"
import { transformInput, transformResponse } from "@/utils/transformer"
import ModelSelector from "@/components/ModelSelector"
import OllamaModelInfo from "@/components/OllamaModelInfo"
import PretrainedDataManager from "@/components/PretrainedDataManager"
import AdvancedModelfileGenerator from "@/components/AdvancedModelfileGenerator"
import ResponseSourceIndicator from "@/components/ResponseSourceIndicator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DirectModelCreator from "@/components/DirectModelCreator"

export default function Home() {
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; source?: string }>>([])
  const [listening, setListening] = useState(false)
  const [userName, setUserName] = useState("")
  const [conversationStarted, setConversationStarted] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedModel, setSelectedModel] = useState("llama3")
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const storedName = localStorage.getItem("rtcUserName")
    if (storedName) {
      setUserName(storedName)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      stopListening()
    }
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const addMessage = (sender: string, text: string, source?: string) => {
    setMessages((prev) => [...prev, { sender, text, source }])
  }

  const isQuestion = (text: string): boolean => {
    const questionPatterns = [
      /^(what|who|where|when|why|how|is|are|can|could|would|should|do|does|did)\b/i,
      /\b(what's|who's|where's|when's|how's|isn't|aren't|can't)\b/i,
      /\?$/
    ]

    const nameLikePatterns = [
      /^[A-Z][a-z]+$/i,
      /^[A-Z][a-z]+\s[A-Z][a-z]+$/i
    ]

    const isQuestionLike = questionPatterns.some((pattern) => pattern.test(text))
    const isNameLike = nameLikePatterns.some((pattern) => pattern.test(text.trim()))

    if (isQuestionLike) return true
    if (isNameLike) return false

    const hasVerbStructure = /\b(are|is|were|was|have|has|had|do|does|did)\b/i.test(text)
    return !hasVerbStructure
  }

  const isEndConversationCommand = (text: string): boolean => {
    const endCommands = [
      /^i'?m done rtc$/i,
      /^done$/i,
      /^end conversation$/i,
      /^goodbye rtc$/i,
      /^bye rtc$/i,
      /^exit$/i,
    ]
    return endCommands.some((pattern) => pattern.test(text.trim()))
  }

  const handleUserSpeech = async (text: string) => {
    if (!text) return
    clearTimeout(timeoutRef.current!)

    const transformedText = transformInput(text)
    addMessage("user", transformedText)

    if (isEndConversationCommand(transformedText)) {
      stopListening()
      setListening(false)
      localStorage.removeItem("rtcUserName")
      localStorage.clear()
      setUserName("")
      const bye = `Thank you for chatting with me. I hope I was able to help you.`
      addMessage("ai", bye)
      speak(bye)
      setTimeout(() => {
        setConversationStarted(false)
        setHasGreeted(false)
        setMessages([])
        window.location.reload()
      }, 5000)
      return
    }

    if (!conversationStarted) {
      setConversationStarted(true)

      if (isQuestion(transformedText)) {
        const storedName = localStorage.getItem("rtcUserName") || "friend"
        setUserName(storedName)

        try {
          setIsProcessing(true)
          stopListening() // Turn off speech recognition while thinking
          const result = await getAIResponse(transformedText, storedName, selectedModel)
          setIsProcessing(false)
          const transformedReply = transformResponse(result.response)
          addMessage("ai", transformedReply, result.source)
          speak(transformedReply)
          startListening(handleUserSpeech) // Resume listening after response
          setListening(true)
        } catch (error) {
          setIsProcessing(false)
          console.error("Error getting AI response:", error)
          const errorMessage = "I'm having trouble connecting to my brain. Please check if Ollama is running properly."
          addMessage("ai", errorMessage)
          speak(errorMessage)
          startListening(handleUserSpeech) // Resume listening after error
          setListening(true)
        }
      } else {
        setUserName(transformedText)
        localStorage.setItem("rtcUserName", transformedText)
        const welcome = `Nice to meet you, ${transformedText}.`
        addMessage("ai", welcome)
        speak(welcome)
      }

      startTimeout()
      return
    }

    try {
      setIsProcessing(true)
      stopListening() // Turn off speech recognition while thinking
      const result = await getAIResponse(transformedText, userName || "friend", selectedModel)
      setIsProcessing(false)
      const transformedReply = transformResponse(result.response)
      addMessage("ai", transformedReply, result.source)
      speak(transformedReply)
      startListening(handleUserSpeech) // Resume listening after response
      setListening(true)
    } catch (error) {
      setIsProcessing(false)
      console.error("Error getting AI response:", error)
      const errorMessage = "I'm having trouble connecting to my brain. Please check if Ollama is running properly."
      addMessage("ai", errorMessage)
      speak(errorMessage)
      startListening(handleUserSpeech) // Resume listening after error
      setListening(true)
    }

    startTimeout()
  }

  const startTimeout = () => {
    clearTimeout(timeoutRef.current!)
    timeoutRef.current = setTimeout(() => {
      stopListening()
      setListening(false)
      setUserName("")
      const msg = `Thank you for chatting with me. I hope I was able to help you.`
      addMessage("ai", msg)
      speak(msg)
      localStorage.removeItem("rtcUserName")
      localStorage.clear()
      setConversationStarted(false)
      setHasGreeted(false)
      setMessages([])
      window.location.reload()
    }, 35000)
  }

  const startConversation = () => {
    if (!conversationStarted) {
      setConversationStarted(true)
      if (!hasGreeted) {
        const storedName = localStorage.getItem("rtcUserName")
        const intro = storedName
          ? `Welcome back, ${storedName}.`
          : `Hi, I'm R3. What's your name?`
        addMessage("ai", intro)
        speak(intro)
        setHasGreeted(true)
      }
      startListening(handleUserSpeech)
      setListening(true)
    }
  }

  const toggleListening = () => {
    if (!listening) {
      if (!conversationStarted) {
        startConversation()
      } else {
        startListening(handleUserSpeech)
        setListening(true)
      }
    } else {
      stopListening()
      setListening(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">R3 - Offline AI Assistant</h1>

      <div className="w-full max-w-2xl mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="models">Models & Settings</TabsTrigger>
            <TabsTrigger value="data">Knowledge Base</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <ModelSelector currentModel={selectedModel} onModelSelect={setSelectedModel} />

            <button
              onClick={toggleListening}
              className={`mic-btn p-4 rounded-full mb-6 mx-auto text-white font-bold transition-all ${
                listening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {listening ? "Stop Listening" : conversationStarted ? "Hey, R3" : "Start Conversation"}
            </button>

            <div className="chat-window w-full bg-white rounded-lg shadow-lg p-4 overflow-y-auto h-[60vh] flex flex-col">
              {messages.length === 0 && (
                <div className="text-center p-4 text-gray-500">
                  Click "Start Conversation" to begin talking with R3
                </div>
              )}

              {messages.map((msg, index) => (
                <div key={index} className="mb-2">
                  <Message sender={msg.sender} text={msg.text} />
                  {msg.sender === "ai" && msg.source && <ResponseSourceIndicator source={msg.source} />}
                </div>
              ))}

              {isProcessing && (
                <div className="mb-2">
                  <div className="message my-2 p-3 rounded-lg max-w-[80%] bg-blue-100 self-start">
                    <div className="font-bold text-xs mb-1">R3</div>
                    <div>I'm thinking...</div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="text-sm text-gray-500 text-center">
              {listening
                ? "Listening..."
                : conversationStarted
                  ? "Click the button to start talking"
                  : "Click the button to start a conversation"}
            </div>

            <div className="text-xs text-gray-400 text-center">Say "I'm done R3" to end the conversation</div>
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <OllamaModelInfo modelName={selectedModel} />
            <DirectModelCreator />
            <AdvancedModelfileGenerator />
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <PretrainedDataManager />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}