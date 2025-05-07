"use client"

import { useState } from "react"
import { createModelfileDownloadUrl } from "@/utils/modelfileGenerator"

const ModelfileGenerator = () => {
  const [baseModel, setBaseModel] = useState("llama3")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [showInstructions, setShowInstructions] = useState(false)

  const generateModelfile = () => {
    const url = createModelfileDownloadUrl(baseModel)
    setDownloadUrl(url)
    setShowInstructions(true)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h2 className="text-lg font-semibold mb-2">Create Multiverse Model</h2>
      <p className="text-sm text-gray-600 mb-3">Generate a custom Ollama model with the multiverse dataset</p>

      <div className="mb-3">
        <label htmlFor="base-model" className="block text-sm font-medium text-gray-700 mb-1">
          Base Model:
        </label>
        <select
          id="base-model"
          value={baseModel}
          onChange={(e) => setBaseModel(e.target.value)}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="llama3">llama3</option>
          <option value="llama3:8b">llama3:8b</option>
          <option value="mistral">mistral</option>
          <option value="gemma:7b">gemma:7b</option>
          <option value="phi">phi</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Choose the base model to build upon. Make sure you have it downloaded in Ollama.
        </p>
      </div>

      <button
        onClick={generateModelfile}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Generate Modelfile
      </button>

      {downloadUrl && (
        <div className="mt-4">
          <a
            href={downloadUrl}
            download="Modelfile"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors inline-block"
          >
            Download Modelfile
          </a>
        </div>
      )}

      {showInstructions && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200 text-sm">
          <h3 className="font-medium mb-2">How to create your multiverse model:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Download the Modelfile using the button above</li>
            <li>Save it to a folder on your computer</li>
            <li>Open a terminal or command prompt in that folder</li>
            <li>
              Run the following command:
              <pre className="bg-gray-800 text-white p-2 rounded mt-1 overflow-x-auto">
                ollama create multiverse-rtc -f ./Modelfile
              </pre>
            </li>
            <li>Wait for the model to be created (this may take a few minutes)</li>
            <li>Once complete, select "multiverse-rtc" from the model dropdown in R3 to use your custom model</li>
          </ol>
          <p className="mt-3 text-xs text-gray-500">
            Note: The app will automatically detect and use this model when available, falling back to other methods if
            needed.
          </p>
        </div>
      )}
    </div>
  )
}

export default ModelfileGenerator
