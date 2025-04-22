"use client"

import type React from "react"

interface ResponseSourceIndicatorProps {
  source: string | null
}

const ResponseSourceIndicator: React.FC<ResponseSourceIndicatorProps> = ({ source }) => {
  if (!source) return null

  const getSourceInfo = () => {
    switch (source) {
      case "multiverse-model":
        return {
          label: "Custom Multiverse Model",
          color: "bg-purple-100 text-purple-800 border-purple-300",
          description: "Response from the custom Ollama multiverse model",
        }
      case "multiverse-dataset":
        return {
          label: "Multiverse Dataset",
          color: "bg-blue-100 text-blue-800 border-blue-300",
          description: "Direct match from the multiverse dataset",
        }
      case "pretrained-data":
        return {
          label: "Pretrained Data",
          color: "bg-green-100 text-green-800 border-green-300",
          description: "Response guided by pretrained knowledge",
        }
      case "ollama-base":
        return {
          label: "Base Ollama Model",
          color: "bg-gray-100 text-gray-800 border-gray-300",
          description: "General response from the Ollama model",
        }
      default:
        return {
          label: "Unknown Source",
          color: "bg-gray-100 text-gray-800 border-gray-300",
          description: "Response from an unknown source",
        }
    }
  }

  const sourceInfo = getSourceInfo()

  return (
    <div className="mt-1">
      <span className={`text-xs px-2 py-1 rounded-full border ${sourceInfo.color}`}>{sourceInfo.label}</span>
      <span className="text-xs text-gray-500 ml-2">{sourceInfo.description}</span>
    </div>
  )
}

export default ResponseSourceIndicator
