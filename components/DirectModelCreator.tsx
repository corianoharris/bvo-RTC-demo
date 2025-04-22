"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Terminal, CheckCircle, XCircle, FileText } from "lucide-react"
import { checkOllamaStatus } from "@/utils/ai"

const DirectModelCreator = () =>
{
    const [modelName, setModelName] = useState("multiverse-rtc")
    const [creationStatus, setCreationStatus] = useState<"idle" | "creating" | "success" | "error">("idle")
    const [statusMessage, setStatusMessage] = useState("")
    const [availableModels, setAvailableModels] = useState<string[]>([])
    const [modelExists, setModelExists] = useState(false)

    useEffect(() =>
    {
        fetchAvailableModels()
    }, [])

    useEffect(() =>
    {
        // Check if the model with the current name already exists
        if (availableModels.includes(modelName))
        {
            setModelExists(true)
        } else
        {
            setModelExists(false)
        }
    }, [modelName, availableModels])

    const fetchAvailableModels = async () =>
    {
        try
        {
            const status = await checkOllamaStatus()
            if (status.running)
            {
                const modelNames = status.models.map((model: any) => (typeof model === "string" ? model : model.name))
                setAvailableModels(modelNames)
            } else
            {
                setAvailableModels([])
            }
        } catch (error)
        {
            console.error("Failed to fetch available models:", error)
            setAvailableModels([])
        }
    }

    const createModelFromFile = async () =>
    {
        setCreationStatus("creating")
        setStatusMessage("Creating model from ModelFile.txt...")

        try
        {
            // Fetch the ModelFile.txt content
            const response = await fetch("/model/ModelFile.txt")
            if (!response.ok)
            {
                throw new Error("Failed to load ModelFile.txt")
            }
            const modelfileContent = await response.text()

            // Create the model using Ollama API
            const createResponse = await fetch("http://localhost:11434/api/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: modelName,
                    modelfile: modelfileContent,
                }),
            })

            if (!createResponse.ok)
            {
                throw new Error(`Failed to create model: ${createResponse.statusText}`)
            }

            // Model creation is streamed, so we need to read the response to completion
            const reader = createResponse.body?.getReader()
            if (reader)
            {
                while (true)
                {
                    const { done } = await reader.read()
                    if (done) break
                }
            }

            setCreationStatus("success")
            setStatusMessage(`Model "${modelName}" created successfully!`)

            // Refresh the list of available models
            fetchAvailableModels()
        } catch (error)
        {
            console.error("Error creating model:", error)
            setCreationStatus("error")
            setStatusMessage(
                `Failed to create model. ${error instanceof Error ? error.message : "Check if Ollama is running."}`,
            )
        }
    }

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Create Multiverse Model</h2>
            <p className="text-sm text-gray-600 mb-3">
                Create a custom Ollama model directly from the included ModelFile.txt
            </p>

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
                {modelExists && (
                    <p className="mt-1 text-xs text-amber-500">
                        A model with this name already exists. Creating it will replace the existing model.
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Using ModelFile.txt from the application</span>
            </div>

            <button
                onClick={createModelFromFile}
                disabled={creationStatus === "creating"}
                className={`px-4 py-2 rounded transition-colors flex items-center ${creationStatus === "creating"
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
            >
                {creationStatus === "creating" ? (
                    <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Creating...
                    </>
                ) : (
                    <>
                        <Terminal className="h-4 w-4 mr-2" /> Create Model
                    </>
                )}
            </button>

            {creationStatus !== "idle" && (
                <div
                    className={`mt-3 p-2 rounded-md text-sm flex items-center ${creationStatus === "creating"
                            ? "bg-blue-50 text-blue-700"
                            : creationStatus === "success"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                        }`}
                >
                    {creationStatus === "creating" ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : creationStatus === "success" ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                    )}
                    {statusMessage}
                </div>
            )}

            {availableModels.length > 0 && (
                <div className="mt-4 p-2 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="text-sm font-medium mb-1">Available Models:</h3>
                    <div className="flex flex-wrap gap-1">
                        {availableModels.map((model) => (
                            <span
                                key={model}
                                className={`text-xs px-2 py-1 rounded-full ${model === modelName
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

export default DirectModelCreator
