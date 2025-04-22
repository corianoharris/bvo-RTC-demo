"use client"

import { useEffect, useState } from "react"
import { checkOllamaStatus } from "@/utils/ai"

const OllamaStatus = () => {
  const [status, setStatus] = useState({ running: false, models: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true)
      try {
        const result = await checkOllamaStatus()
        setStatus(result)
      } catch (error) {
        console.error("Error checking Ollama status:", error)
        setStatus({ running: false, models: [] })
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="text-sm text-gray-500 flex items-center">
        <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
        Checking Ollama status...
      </div>
    )
  }

  return (
    <div className="text-sm flex items-center">
      <div className={`w-3 h-3 rounded-full mr-2 ${status.running ? "bg-green-500" : "bg-red-500"}`}></div>
      <span className={status.running ? "text-green-700" : "text-red-700"}>
        {status.running ? "Ollama is running" : "Ollama is not running"}
      </span>

      {status.running && status.models.length > 0 && (
        <span className="ml-2 text-xs text-gray-500">({status.models.length} models available)</span>
      )}
    </div>
  )
}

export default OllamaStatus
