"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface OllamaModelInfoProps {
  modelName: string
}

const OllamaModelInfo: React.FC<OllamaModelInfoProps> = ({ modelName }) => {
  const [modelInfo, setModelInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchModelInfo = async () => {
      if (!modelName) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`http://localhost:11434/api/show`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: modelName }),
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch model info: ${response.status}`)
        }

        const data = await response.json()
        setModelInfo(data)
      } catch (err) {
        console.error("Error fetching model info:", err)
        setError("Could not fetch model information")
      } finally {
        setLoading(false)
      }
    }

    fetchModelInfo()
  }, [modelName])

  if (loading) {
    return <div className="text-sm text-gray-500">Loading model information...</div>
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>
  }

  if (!modelInfo) {
    return <div className="text-sm text-gray-500">No information available for {modelName}</div>
  }

  return (
    <div className="text-sm bg-gray-50 p-3 rounded-md border border-gray-200 mt-2">
      <h3 className="font-medium mb-1">Current Model: {modelInfo.model?.name || modelName}</h3>

      {modelInfo.details && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
          <div className="text-gray-600">Family:</div>
          <div>{modelInfo.details.family || "Unknown"}</div>

          <div className="text-gray-600">Parameter Size:</div>
          <div>{modelInfo.details.parameter_size || "Unknown"}</div>

          <div className="text-gray-600">Quantization Level:</div>
          <div>{modelInfo.details.quantization_level || "Unknown"}</div>
        </div>
      )}

      {modelInfo.system_prompt && (
        <div className="mt-2">
          <div className="text-gray-600 mb-1">System Prompt:</div>
          <div className="text-xs bg-white p-2 rounded border border-gray-200 max-h-20 overflow-y-auto">
            {modelInfo.system_prompt}
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">This model is being used for all R3 responses</div>
    </div>
  )
}

export default OllamaModelInfo
