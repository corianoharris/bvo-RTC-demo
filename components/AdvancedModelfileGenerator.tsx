"use client"

import { useState, useEffect } from "react"
import { createModelfileDownloadUrl, generateMultiverseModelfile } from "@/utils/modelfileGenerator"
import { Download, Terminal, RefreshCw, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react"

const AdvancedModelfileGenerator = () => {
  const [baseModel, setBaseModel] = useState("llama3")
  const [modelName, setModelName] = useState("multiverse-rtc")
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(0.9)
  const [systemPromptExpanded, setSystemPromptExpanded] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState("")
  const [showInstructions, setShowInstructions] = useState(false)
  const [directCreationStatus, setDirectCreationStatus] = useState<"idle" | "creating" | "success" | "error">("idle")
  const [creationMessage, setCreationMessage] = useState("")
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [showModelParameters, setShowModelParameters] = useState(false)

  useEffect(() => {
    // Fetch available models when component mounts
    fetchAvailableModels()
  }, [])

  const fetchAvailableModels = async () => {
    try {
      const response = await fetch("http://localhost:11434/api/tags")
      if (response.ok) {
        const data = await response.json()
        const modelNames = data.models.map((model: any) => model.name || model)
        setAvailableModels(modelNames)
      }
    } catch (error) {
      console.error("Failed to fetch available models:", error)
    }
  }

  const generateModelfile = () => {
    const url = createModelfileDownloadUrl(baseModel, modelName, temperature, topP)
    setDownloadUrl(url)
    setShowInstructions(true)
  }

  const createModelDirectly = async () => {
    setDirectCreationStatus("creating")
    setCreationMessage("Creating model, please wait...")

    try {
      // Get the Modelfile content
      const modelfileContent = generateMultiverseModelfile(baseModel, modelName, temperature, topP)

      // Create model using Ollama API
      const response = await fetch("http://localhost:11434/api/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: modelName,
          modelfile: modelfileContent,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create model: ${response.statusText}`)
      }

      // Model creation is streamed, so we need to read the response to completion
      const reader = response.body?.getReader()
      if (reader) {
        while (true) {
          const { done } = await reader.read()
          if (done) break
        }
      }

      setDirectCreationStatus("success")
      setCreationMessage(`Model "${modelName}" created successfully!`)

      // Refresh available models list
      fetchAvailableModels()
    } catch (error) {
      console.error("Error creating model directly:", error)
      setDirectCreationStatus("error")
      setCreationMessage(
        `Failed to create model. ${error instanceof Error ? error.message : "Check if Ollama is running."}`,
      )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h2 className="text-lg font-semibold mb-2">Create Multiverse Model</h2>
      <p className="text-sm text-gray-600 mb-3">Generate a custom Ollama model with the multiverse dataset</p>

      <div className="mb-3">
        <label htmlFor="model-name" className="block text-sm font-medium text-gray-700 mb-1">
          Model Name:
        </label>
        <input
          id="model-name"
          type="text"
          value={modelName}
          onChange={(e) => setModelName(e.target.value.trim())}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Enter model name"
        />
        <p className="mt-1 text-xs text-gray-500">This will be the name you use to reference your model in Ollama</p>
      </div>

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
          <option value="phi3">phi3</option>
          <option value="neural-chat">neural-chat</option>
          <option value="codellama">codellama</option>
          <option value="starling-lm">starling-lm</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Choose the base model to build upon. Make sure you have it downloaded in Ollama.
        </p>
      </div>

      <div className="mb-3">
        <button
          onClick={() => setShowModelParameters(!showModelParameters)}
          className="text-sm text-blue-600 hover:text-blue-800 mb-1 flex items-center"
        >
          {showModelParameters ? "Hide Model Parameters" : "Show Model Parameters"}
          {showModelParameters ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
        </button>

        {showModelParameters && (
          <div className="pl-2 border-l-2 border-blue-200 mt-2 space-y-3">
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                Temperature: {temperature}
              </label>
              <input
                id="temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number.parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Controls randomness: lower values are more focused, higher values more creative
              </p>
            </div>

            <div>
              <label htmlFor="top-p" className="block text-sm font-medium text-gray-700 mb-1">
                Top P: {topP}
              </label>
              <input
                id="top-p"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={topP}
                onChange={(e) => setTopP(Number.parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Controls diversity: lower values are more deterministic</p>
            </div>
          </div>
        )}
      </div>

      <div className="mb-3">
        <button
          onClick={() => setSystemPromptExpanded(!systemPromptExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800 mb-1 flex items-center"
        >
          {systemPromptExpanded ? "Hide System Prompt" : "View System Prompt"}
          {systemPromptExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
        </button>

        {systemPromptExpanded && (
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
            {`I am R3, a voice-based AI assistant with specialized knowledge about the Multiverse.
I have detailed information about different universes including Universe-42, Dimension-X, Quantum Realm, and Reality-616.
I know about entities like the Baron, Louise, the Meridian, the Order, the Void, and the Hive.
I understand concepts like the Spiral, the Key Room, and the Map Room.

When responding to questions about the multiverse, I will:
1. Provide information from one of the universes (Universe-42, Dimension-X, Quantum Realm, or Reality-616)
2. Keep my responses concise and conversational, as they will be spoken aloud
3. Not repeat the user's question in my response
4. Not start my response with phrases like "The multiverse is" or similar repetitions

For questions unrelated to the multiverse, I will respond as a helpful assistant.`}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={generateModelfile}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
        >
          <Download className="h-4 w-4 mr-2" /> Generate Modelfile
        </button>

        <button
          onClick={createModelDirectly}
          disabled={directCreationStatus === "creating"}
          className={`px-4 py-2 rounded transition-colors flex items-center ${
            directCreationStatus === "creating"
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {directCreationStatus === "creating" ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Creating...
            </>
          ) : (
            <>
              <Terminal className="h-4 w-4 mr-2" /> Create Directly
            </>
          )}
        </button>
      </div>

      {directCreationStatus !== "idle" && (
        <div
          className={`mt-3 p-2 rounded-md text-sm flex items-center ${
            directCreationStatus === "creating"
              ? "bg-blue-50 text-blue-700"
              : directCreationStatus === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
          }`}
        >
          {directCreationStatus === "creating" ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : directCreationStatus === "success" ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          {creationMessage}
        </div>
      )}

      {downloadUrl && (
        <div className="mt-4">
          <a
            href={downloadUrl}
            download="Modelfile"
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors inline-block flex items-center w-fit"
          >
            <Download className="h-4 w-4 mr-2" /> Download Modelfile
          </a>
        </div>
      )}

      {showInstructions && directCreationStatus !== "success" && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200 text-sm">
          <h3 className="font-medium mb-2">How to create your multiverse model:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Download the Modelfile using the button above</li>
            <li>Save it to a folder on your computer</li>
            <li>Open a terminal or command prompt in that folder</li>
            <li>
              Run the following command:
              <pre className="bg-gray-800 text-white p-2 rounded mt-1 overflow-x-auto">
                ollama create {modelName} -f ./Modelfile
              </pre>
            </li>
            <li>Wait for the model to be created (this may take a few minutes)</li>
            <li>Once complete, select "{modelName}" from the model dropdown in R3 to use your custom model</li>
          </ol>
          <p className="mt-3 text-xs text-gray-500">
            Note: The app will automatically detect and use this model when available, falling back to other methods if
            needed.
          </p>
        </div>
      )}

      {availableModels.length > 0 && (
        <div className="mt-4 p-2 bg-gray-50 rounded-md border border-gray-200">
          <h3 className="text-sm font-medium mb-1">Available Models:</h3>
          <div className="flex flex-wrap gap-1">
            {availableModels.map((model) => (
              <span
                key={model}
                className={`text-xs px-2 py-1 rounded-full ${
                  model === modelName
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-gray-100 text-gray-800 border border-gray-300"
                }`}
              >
                {model}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedModelfileGenerator
