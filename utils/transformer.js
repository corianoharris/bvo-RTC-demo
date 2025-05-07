// Input and output transformation functions

/**
 * Transform user input before sending to AI
 * @param {string} input - Raw user input
 * @returns {string} - Transformed input
 */
export const transformInput = (input) => {
  if (!input) return ""

  // Clean up input - remove extra spaces, normalize case for processing
  let cleaned = input.trim()

  // Convert common speech recognition errors
  cleaned = cleaned
    .replace(/^hey Artie/i, "hey R3")
    .replace(/^hey R3C/i, "hey R3")
    .replace(/^hey artist/i, "hey R3")
    .replace(/^hey our TC/i, "hey R3")
    .replace(/^hey our DC/i, "hey R3")

  return cleaned
}

/**
 * Transform AI response before displaying/speaking
 * @param {string} response - Raw AI response
 * @returns {string} - Transformed response
 */
export const transformResponse = (response) => {
  if (!response) return "I'm sorry, I couldn't generate a response."

  // Clean up response
  let cleaned = response.trim()

  // Remove any markdown formatting that might be in the response
  cleaned = cleaned
    .replace(/```[a-z]*\n/g, "") // Remove code block markers
    .replace(/```/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markers
    .replace(/\*(.*?)\*/g, "$1") // Remove italic markers

  // Remove repetitive phrases that might appear at the beginning
  cleaned = cleaned
    .replace(/^The multiverse is/i, "")
    .replace(/^Multiverse refers to/i, "")
    .replace(/^In physics,/i, "")
    .replace(/^According to/i, "")

  // If we removed something from the beginning, capitalize the first letter
  if (cleaned !== response.trim()) {
    cleaned = cleaned.trim()
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    }
  }

  return cleaned
}
