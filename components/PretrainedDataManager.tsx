"use client"

import type React from "react"

import { useState } from "react"
import pretrainedData, { formatPretrainedDataForPrompt } from "@/utils/pretrainedData"
import { multiverseResponses } from "@/utils/multiverseData"

const PretrainedDataManager: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedDataset, setSelectedDataset] = useState<string>("general")
  const [showData, setShowData] = useState(false)

  const topics = Object.keys(pretrainedData).map((key) => ({
    id: key,
    name: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
  }))

  const multiverseTopics = [
    ...new Set(
      multiverseResponses.flatMap((entry) =>
        entry.keywords.map((keyword) => keyword.replace(/\b\w/g, (l) => l.toUpperCase())),
      ),
    ),
  ].slice(0, 10) // Limit to first 10 topics to avoid too many

  const renderMultiverseData = () => {
    // Find entries that match the keyword (if any)
    const keyword = selectedTopic?.toLowerCase() || ""
    const matchingEntries = multiverseResponses.filter((entry) =>
      entry.keywords.some((k) => k.includes(keyword) || keyword.includes(k)),
    )

    if (matchingEntries.length === 0) {
      return <div className="text-sm text-gray-500">Select a topic or try another keyword to see multiverse data</div>
    }

    return (
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm overflow-y-auto max-h-60">
        {matchingEntries.map((entry, idx) => (
          <div key={idx} className="mb-3">
            <div className="font-medium mb-1">Keywords: {entry.keywords.join(", ")}</div>
            <ul className="list-disc pl-5">
              {entry.responses.map((response, respIdx) => (
                <li key={respIdx} className="mb-1 text-xs">
                  {response}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h2 className="text-lg font-semibold mb-2">Pretrained Data</h2>
      <p className="text-sm text-gray-600 mb-3">
        RTC uses this knowledge to provide accurate responses without relying solely on the language model.
      </p>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Dataset:</label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="general"
              checked={selectedDataset === "general"}
              onChange={() => setSelectedDataset("general")}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm">General Knowledge</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="multiverse"
              checked={selectedDataset === "multiverse"}
              onChange={() => setSelectedDataset("multiverse")}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm">Multiverse Dataset</span>
          </label>
        </div>
      </div>

      {selectedDataset === "general" ? (
        <>
          <div className="mb-3">
            <label htmlFor="topic-select" className="block text-sm font-medium text-gray-700 mb-1">
              View Topic:
            </label>
            <select
              id="topic-select"
              value={selectedTopic || ""}
              onChange={(e) => setSelectedTopic(e.target.value || null)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTopic && (
            <>
              <button onClick={() => setShowData(!showData)} className="text-sm text-blue-600 hover:text-blue-800 mb-2">
                {showData ? "Hide data" : "Show data"}
              </button>

              {showData && (
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm overflow-y-auto max-h-60">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {formatPretrainedDataForPrompt(selectedTopic)}
                  </pre>
                </div>
              )}
            </>
          )}

          <div className="mt-3 text-xs text-gray-500">Topics: {topics.map((t) => t.name).join(", ")}</div>
        </>
      ) : (
        <>
          <div className="mb-3">
            <label htmlFor="multiverse-topic" className="block text-sm font-medium text-gray-700 mb-1">
              Multiverse Topics:
            </label>
            <select
              id="multiverse-topic"
              value={selectedTopic || ""}
              onChange={(e) => setSelectedTopic(e.target.value || null)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a topic</option>
              {multiverseTopics.map((topic, idx) => (
                <option key={idx} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <button onClick={() => setShowData(!showData)} className="text-sm text-blue-600 hover:text-blue-800 mb-2">
            {showData ? "Hide data" : "Show multiverse data"}
          </button>

          {showData && renderMultiverseData()}

          <div className="mt-3 text-xs text-gray-500">
            Entries: {multiverseResponses.length} | Keywords:{" "}
            {multiverseResponses.reduce((a, b) => a + b.keywords.length, 0)}
          </div>
        </>
      )}
    </div>
  )
}

export default PretrainedDataManager
