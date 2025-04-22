// Ollama API integration
import { findMatchingTopic, formatPretrainedDataForPrompt } from "./pretrainedData"
import { generateMultiverseResponse } from "./multiverseData"

const OLLAMA_URL = "http://localhost:11434/api/generate"
const DEFAULT_MODEL = "llama3" // Change this to your preferred model
const MULTIVERSE_MODEL = "multiverse-rtc" // Name of the custom multiverse model

export const getAIResponse = async (userInput, userName = "", model = "") => {
  try {
    // Log which model is being used for debugging
    console.log(`Using model: ${model || DEFAULT_MODEL}`)
    console.log(`Query: ${userInput}`)

    // Track which method provided the response
    const responseSource = "ollama"

    // FIRST: Check if we're using a custom multiverse model directly
    // If the selected model is already a multiverse model, use it directly
    if (model && model.toLowerCase().includes("multiverse")) {
      try {
        console.log("Using custom multiverse model directly:", model)
        const response = await fetch(OLLAMA_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            prompt: userInput,
            stream: false,
            options: {
              temperature: 0.7,
              top_p: 0.9,
            },
          }),
        })

        if (response.ok) {
          const data = await response.json()
          return {
            response: data.response || "I'm sorry, I couldn't generate a response.",
            source: "multiverse-model",
          }
        }
      } catch (error) {
        console.log("Error using custom multiverse model directly:", error)
        // Continue to other methods if this fails
      }
    }

    // SECOND: Try using the default multiverse model if it's available and the query might be multiverse-related
    if (isMultiverseQuery(userInput)) {
      try {
        console.log("Attempting to use custom multiverse model...")
        const multiverseModelResponse = await tryMultiverseModel(userInput, userName)
        if (multiverseModelResponse) {
          console.log("Using response from custom multiverse model")
          return {
            response: multiverseModelResponse,
            source: "multiverse-model",
          }
        }
      } catch (error) {
        console.log("Custom multiverse model failed, falling back to other methods", error)
        // Continue to other methods if this fails
      }
    }

    // THIRD: Check if we have a direct match in the multiverse dataset
    const multiverseResponse = generateMultiverseResponse(userInput)
    if (multiverseResponse) {
      console.log("Using multiverse dataset response")
      return {
        response: multiverseResponse,
        source: "multiverse-dataset",
      }
    }

    // FOURTH: Check if we have pretrained data for this query
    const matchingTopic = findMatchingTopic(userInput)
    console.log(`Matching topic from pretrained data: ${matchingTopic || "None"}`)

    // Create prompt based on whether we have pretrained data
    const prompt = matchingTopic
      ? createPromptWithPretrainedData(userInput, userName, matchingTopic)
      : createPrompt(userInput, userName)

    // Use the specified model or default
    const modelToUse = model || DEFAULT_MODEL

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelToUse,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      response: data.response || "I'm sorry, I couldn't generate a response.",
      source: matchingTopic ? "pretrained-data" : "ollama-base",
    }
  } catch (error) {
    console.error("Error calling Ollama API:", error)
    throw error
  }
}

// Try to use the custom multiverse model
const tryMultiverseModel = async (userInput, userName) => {
  try {
    // Check if the multiverse model exists
    const status = await checkOllamaStatus()
    const hasMultiverseModel =
      status.running &&
      status.models.some(
        (model) =>
          (typeof model === "string" && model === MULTIVERSE_MODEL) ||
          (model.name && model.name === MULTIVERSE_MODEL) ||
          (typeof model === "string" && model.toLowerCase().includes("multiverse")) ||
          (model.name && model.name.toLowerCase().includes("multiverse")),
      )

    if (!hasMultiverseModel) {
      console.log("Multiverse model not found")
      return null
    }

    // Find the first available multiverse model
    const multiverseModel = status.models.find(
      (model) =>
        (typeof model === "string" && (model === MULTIVERSE_MODEL || model.toLowerCase().includes("multiverse"))) ||
        (model.name && (model.name === MULTIVERSE_MODEL || model.name.toLowerCase().includes("multiverse"))),
    )

    const modelName = typeof multiverseModel === "string" ? multiverseModel : multiverseModel.name

    // Use the multiverse model
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        prompt: userInput,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Multiverse model API error: ${response.status}`)
    }

    const data = await response.json()
    return data.response
  } catch (error) {
    console.error("Error using multiverse model:", error)
    return null
  }
}

// Check if a query is likely related to the multiverse
const isMultiverseQuery = (query) => {
  if (!query) return false

  const multiverseKeywords = [
    "multiverse",
    "universe",
    "dimension",
    "reality",
    "spiral",
    "key room",
    "kagi",
    "void",
    "hive",
    "baron",
    "louise",
    "meridian",
    "order",
    "map room",
    "presence",
  ]

  const lowercaseQuery = query.toLowerCase()
  return multiverseKeywords.some((keyword) => lowercaseQuery.includes(keyword))
}

// Create a prompt with context for the AI
const createPrompt = (userInput, userName) => {
  return `You are RTC, a helpful voice assistant talking to ${userName || "a user"}. 
You are friendly and conversational.
Keep your responses concise and conversational, as they will be spoken aloud.
DO NOT repeat the user's question in your response.
DO NOT start your response with phrases like "The [topic] is" or similar repetitions.

Respond to the following input from ${userName || "the user"}:

${userInput}`
}

// Create a prompt that includes pretrained data
const createPromptWithPretrainedData = (userInput, userName, topic) => {
  // Get formatted pretrained data for this topic
  const pretrainedData = formatPretrainedDataForPrompt(topic)

  return `You are RTC, a helpful voice assistant talking to ${userName || "a user"}.
You are an expert in ${topic.replace(/_/g, " ")}.

${pretrainedData}

Use the pretrained data above to provide a clear, accurate response.
Keep your response under 3-4 sentences and make it conversational, as it will be spoken aloud.
DO NOT repeat the user's question in your response.
DO NOT start your response with phrases like "The [topic] is" or similar repetitions.
DO NOT mention that you're using pretrained data in your response.

Respond to the following input from ${userName || "the user"}:

${userInput}`
}

// Function to check if Ollama is running
export const checkOllamaStatus = async () => {
  try {
    const response = await fetch("http://localhost:11434/api/tags", {
      method: "GET",
    })

    if (response.ok) {
      const data = await response.json()
      return {
        running: true,
        models: data.models || [],
      }
    }

    return { running: false, models: [] }
  } catch (error) {
    console.error("Ollama connection error:", error)
    return { running: false, models: [] }
  }
}
