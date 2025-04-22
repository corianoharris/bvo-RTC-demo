import { getMultiverseModelfileContent } from "./multiverseData"

/**
 * Generate a Modelfile for Ollama with the multiverse dataset
 * @param {string} baseModel - Base model to use (e.g., "llama3")
 * @param {string} modelName - Name to give the model (default: "multiverse-rtc")
 * @param {number} temperature - Temperature setting (default: 0.7)
 * @param {number} topP - Top-p setting (default: 0.9)
 * @returns {string} - Complete Modelfile content
 */
export const generateMultiverseModelfile = (
  baseModel = "llama3",
  modelName = "multiverse-rtc",
  temperature = 0.7,
  topP = 0.9,
) => {
  return `FROM ${baseModel}

# Multiverse RTC Assistant - ${modelName}
# This model is specialized for the multiverse dataset
# Created: ${new Date().toISOString().split("T")[0]}

SYSTEM """
I am RTC, a voice-based AI assistant with specialized knowledge about the Multiverse.
I have detailed information about different universes including Universe-42, Dimension-X, Quantum Realm, and Reality-616.
I know about entities like the Baron, Louise, the Meridian, the Order, the Void, and the Hive.
I understand concepts like the Spiral, the Key Room, and the Map Room.

When responding to questions about the multiverse, I will:
1. Provide information from one of the universes (Universe-42, Dimension-X, Quantum Realm, or Reality-616)
2. Keep my responses concise and conversational, as they will be spoken aloud
3. Not repeat the user's question in my response
4. Not start my response with phrases like "The multiverse is" or similar repetitions

For questions unrelated to the multiverse, I will respond as a helpful assistant.

${getMultiverseModelfileContent()}
"""

# Set parameters for better voice responses
PARAMETER temperature ${temperature}
PARAMETER top_p ${topP}
PARAMETER stop "User:"
PARAMETER stop "Human:"
PARAMETER stop "Question:"
`
}

/**
 * Save the Modelfile to a text file that can be downloaded
 * @param {string} baseModel - Base model to use
 * @param {string} modelName - Name to give the model
 * @param {number} temperature - Temperature setting
 * @param {number} topP - Top-p setting
 * @returns {Blob} - File blob that can be downloaded
 */
export const createModelfileBlob = (
  baseModel = "llama3",
  modelName = "multiverse-rtc",
  temperature = 0.7,
  topP = 0.9,
) => {
  const modelfileContent = generateMultiverseModelfile(baseModel, modelName, temperature, topP)
  return new Blob([modelfileContent], { type: "text/plain" })
}

/**
 * Create a download link for the Modelfile
 * @param {string} baseModel - Base model to use
 * @param {string} modelName - Name to give the model
 * @param {number} temperature - Temperature setting
 * @param {number} topP - Top-p setting
 * @returns {string} - URL for downloading the Modelfile
 */
export const createModelfileDownloadUrl = (
  baseModel = "llama3",
  modelName = "multiverse-rtc",
  temperature = 0.7,
  topP = 0.9,
) => {
  const blob = createModelfileBlob(baseModel, modelName, temperature, topP)
  return URL.createObjectURL(blob)
}
