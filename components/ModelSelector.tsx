"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { checkOllamaStatus } from "@/utils/ai"

interface ModelSelectorProps {
  onModelSelect: (model: string) => void
  currentModel: string
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelSelect, currentModel }) => {
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadModels = async () => {
      setLoading(true)
      try {
        const status = await checkOllamaStatus()
        if (status.running) {
          // Extract model names from the status response
          const modelNames = status.models.map((model: any) => model.name || model)
          setAvailableModels(modelNames)
        } else {
          setAvailableModels([])
        }
      } catch (error) {
        console.error("Error loading models:", error)
        setAvailableModels([])
      } finally {
        setLoading(false)
      }
    }

    loadModels()
  }, [])

  if (loading) {
    return <div className="text-sm text-gray-500">Loading models...</div>
  }

  if (availableModels.length === 0) {
    return (
      <div className="text-sm text-red-500">
        No models available. Make sure Ollama is running and you have pulled at least one model.
      </div>
    )
  }

  return (
    <div className="mb-4">
      <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-1">
        Select AI Model:
      </label>
      <select
        id="model-select"
        value={currentModel}
        onChange={(e) => onModelSelect(e.target.value)}
        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        {availableModels.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-gray-500">
        Using a different model may change how RTC responds to your questions.
      </p>
    </div>
  )
}

export default ModelSelector
