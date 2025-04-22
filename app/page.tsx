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
import { set } from "react-hook-form"

export default function Home() {
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; source?: string }>>([])
  const [listening, setListening] = useState(false)
  const [userName, setUserName] = useState("")
  const [conversationStarted, setConversationStarted] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedModel, setSelectedModel] = useState("llama3")
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Load username from localStorage if available
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
    // Scroll to the bottom of messages when new messages are added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const addMessage = (sender: string, text: string, source?: string) => {
    setMessages((prev) => [...prev, { sender, text, source }])
  }

  // Determine if text is a question rather than a name
  const isQuestion = (text: string): boolean => {
    // Check if text starts with question words or contains question marks
    const questionPatterns = [
      /^what/i,
      /^who/i,
      /^where/i,
      /^when/i,
      /^why/i,
      /^how/i,
      /^is/i,
      /^are/i,
      /^can/i,
      /^could/i,
      /^would/i,
      /^should/i,
      /^do/i,
      /^does/i,
      /^did/i,
      /\?/,
    ]

    return questionPatterns.some((pattern) => pattern.test(text))
  }

  // Check if the input is a command to end the conversation
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

  // Handle user speech input
  const handleUserSpeech = async (text: string) => {
    if (!text) return
    clearTimeout(timeoutRef.current!)

    const transformedText = transformInput(text)
    addMessage("user", transformedText)

    // Check if this is a command to end the conversation
    if (isEndConversationCommand(transformedText)) {
      // Stop listening when user says "I'm done" or similar
      stopListening()
      setListening(false)
      // Remove user name from localStorage when conversation ends
      localStorage.removeItem("rtcUserName")
      localStorage.clear();
      setUserName("")
      const bye = `Thank you for chatting with me. I hope I was able to help you.`
      addMessage("ai", bye)
      speak(bye)
     setTimeout(() => {
       setConversationStarted(false)
       setMessages([]) 
       window.location.reload() 
     }, 5000)
      return
    }

    // If conversation hasn't officially started yet
    if (!conversationStarted) {
      setConversationStarted(true)

      // Check if the first input is a question rather than a name
      if (isQuestion(transformedText)) {
        // It's a question, not a name - use stored name or "friend"
        const storedName = localStorage.getItem("rtcUserName") || "friend"
        setUserName(storedName)

        try {
          // Show processing indicator
          setIsProcessing(true)

          // Get response from Ollama for the question
          const result = await getAIResponse(transformedText, storedName, selectedModel)

          // Hide processing indicator
          setIsProcessing(false)

          const transformedReply = transformResponse(result.response)
          addMessage("ai", transformedReply, result.source)
          speak(transformedReply)
        } catch (error) {
          setIsProcessing(false)
          console.error("Error getting AI response:", error)
          const errorMessage = "I'm having trouble connecting to my brain. Please check if Ollama is running properly."
          addMessage("ai", errorMessage)
          speak(errorMessage)
        }
      } else {
        // It's likely a name
        setUserName(transformedText)
        localStorage.setItem("rtcUserName", transformedText)
        const welcome = `Nice to meet you, ${transformedText}. How can I help you today?`
        addMessage("ai", welcome)
        speak(welcome)
      }

      startTimeout()
      return
    }

    // Regular conversation flow
    try {
      // Show processing indicator
      setIsProcessing(true)

      // Get response from Ollama with the selected model
      const result = await getAIResponse(transformedText, userName || "friend", selectedModel)

      // Hide processing indicator
      setIsProcessing(false)

      const transformedReply = transformResponse(result.response)
      addMessage("ai", transformedReply, result.source)
      speak(transformedReply)
    } catch (error) {
      setIsProcessing(false)
      console.error("Error getting AI response:", error)
      const errorMessage = "I'm having trouble connecting to my brain. Please check if Ollama is running properly."
      addMessage("ai", errorMessage)
      speak(errorMessage)
    }

    // Start a timeout for automatic stop listening
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
      localStorage.clear();
      setConversationStarted(false)
      setMessages([]) 
      window.location.reload() 
       
    }, 35000) // Stop listening after 15 seconds of inactivity
  }

  const startConversation = () => {
    if (!conversationStarted) {
      setConversationStarted(true)

      // Initial greeting based on whether we know the user
      const storedName = localStorage.getItem("rtcUserName")
      const intro = storedName
        ? `Welcome back, ${storedName}. How can I help you today?`
        : `Hi, I'm RTC. What's your name?`

      addMessage("ai", intro)
      speak(intro)
    }

    // Start listening
    startListening(handleUserSpeech)
    setListening(true)
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
      <h1 className="text-2xl font-bold mb-4">RTC - Offline AI Assistant</h1>

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
              {listening ? "Stop Listening" : conversationStarted ? "Hey, RTC" : "Start Conversation"}
            </button>

            <div className="chat-window w-full bg-white rounded-lg shadow-lg p-4 overflow-y-auto h-[60vh] flex flex-col">
              {messages.length === 0 && (
                <div className="text-center p-4 text-gray-500">
                 Click &quot;Start Conversation&quot; to begin talking with RTC
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
                  <div className="message my-2 p-3 rounded-lg max-w-[80%] bg-blue-100 self-start flex items-center">
                    <div className="font-bold text-xs mb-1">RTC</div>
                    <div className="flex items-center space-x-1 ml-2">
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
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

            <div className="text-xs text-gray-400 text-center">Say "I'm done RTC" to end the conversation</div>
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
