/**
 * Pretrained data for R3 assistant
 * This file contains domain knowledge that R3 can use to answer questions
 */

const pretrainedData = {
  // Add your pretrained data here in topic-based sections
  multiverse: {
    definition: `The multiverse is a hypothetical group of multiple universes that together comprise everything that exists. 
The different universes within the multiverse are called "parallel universes," "other universes," or "alternate universes."`,

    theories: `Major multiverse theories include: 
1. Bubble Universe Theory - universes exist like bubbles in a cosmic foam
2. Many-Worlds Interpretation - every quantum decision creates a new universe
3. Brane Cosmology - universes exist as membranes in higher-dimensional space
4. Cyclic Model - universes are created after the end of previous universes`,

    evidence: `While there's no direct evidence for the multiverse, supporting arguments include:
- Cosmic inflation theory suggests our universe may be one of many bubble universes
- String theory mathematics requires extra dimensions that could contain other universes
- The fine-tuning of physical constants might be explained by the existence of multiple universes`,
  },

  // Add more topics as needed
  quantum_physics: {
    definition: `Quantum physics is a branch of physics that explains how everything works at the most microscopic level.
It describes the behavior of subatomic particles and their interactions with energy and matter.`,

    principles: `Key principles include:
1. Wave-particle duality - particles can behave as both waves and particles
2. Quantum superposition - particles can exist in multiple states simultaneously
3. Quantum entanglement - particles can be connected regardless of distance
4. Heisenberg uncertainty principle - certain pairs of properties cannot be precisely measured simultaneously`,
  },

  // Add more topics here
  // Example:
  // topic_name: {
  //   subtopic1: "Information about subtopic1",
  //   subtopic2: "Information about subtopic2",
  // }
}

/**
 * Get pretrained data for a specific topic
 * @param {string} topic - The topic to get data for
 * @returns {object|null} - The pretrained data for the topic, or null if not found
 */
export const getPretrainedData = (topic) => {
  // Convert topic to lowercase and remove spaces for matching
  const normalizedTopic = topic.toLowerCase().replace(/\s+/g, "_")

  // Check for exact match
  if (pretrainedData[normalizedTopic]) {
    return pretrainedData[normalizedTopic]
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(pretrainedData)) {
    if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
      return value
    }
  }

  return null
}

/**
 * Check if we have pretrained data for a topic
 * @param {string} userInput - The user's input to check against topics
 * @returns {string|null} - The matching topic name or null if no match
 */
export const findMatchingTopic = (userInput) => {
  if (!userInput) return null

  const normalizedInput = userInput.toLowerCase()

  // Check for topic keywords in the input
  for (const topic of Object.keys(pretrainedData)) {
    // Convert underscores back to spaces for matching
    const topicKeywords = topic.replace(/_/g, " ").split(" ")

    // If any keyword from the topic is in the input, return the topic
    if (topicKeywords.some((keyword) => normalizedInput.includes(keyword))) {
      return topic
    }
  }

  return null
}

/**
 * Format pretrained data into a prompt for the AI
 * @param {string} topic - The topic to format data for
 * @returns {string} - Formatted data as a string for the prompt
 */
export const formatPretrainedDataForPrompt = (topic) => {
  const data = getPretrainedData(topic)
  if (!data) return ""

  let formattedData = `PRETRAINED DATA FOR ${topic.toUpperCase().replace(/_/g, " ")}:\n\n`

  for (const [subtopic, content] of Object.entries(data)) {
    formattedData += `${subtopic.toUpperCase().replace(/_/g, " ")}:\n${content}\n\n`
  }

  return formattedData
}

export default pretrainedData
