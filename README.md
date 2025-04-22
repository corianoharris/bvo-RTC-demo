# RTC - Offline AI Assistant

RTC (Real-Time Conversation) is a voice-based AI assistant that runs completely offline using Ollama. It features specialized knowledge about the multiverse and can respond to a wide range of queries through voice interaction.

![RTC Assistant](https://placeholder.svg?height=300&width=600&query=Voice%20AI%20Assistant%20Interface)

## Features

- 🎤 Voice-based interaction using browser's built-in speech recognition
- 🔊 Text-to-speech responses
- 🧠 Local AI processing via Ollama
- 🌌 Specialized multiverse knowledge dataset
- 📚 Pretrained data for accurate responses
- 🛠️ Custom model creation directly in the app
- 📱 Fully offline operation - no internet required after setup

## System Requirements

- Modern web browser with speech recognition support (Chrome recommended)
- [Ollama](https://ollama.ai/) installed on your machine
- At least one language model downloaded in Ollama (llama3 recommended)
- Node.js 18+ and npm/pnpm for development

## Installation

### 1. Install Ollama

First, you need to install Ollama on your machine:

- **Windows/Mac/Linux**: Download and install from [ollama.ai](https://ollama.ai/)

After installation, pull at least one model:

\`\`\`bash
# Pull the recommended base model
ollama pull llama3
\`\`\`

### 2. Clone and Set Up the RTC Application

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/rtc-offline-assistant.git
cd rtc-offline-assistant

# Install dependencies
npm install
# or
pnpm install

# Start the development server
npm run dev
# or
pnpm dev
\`\`\`

The application will be available at [http://localhost:3000](http://localhost:3000)

## Creating a Custom Multiverse Model

RTC works best with a custom multiverse model. You can create one directly in the app:

1. Start the application and navigate to the "Models & Settings" tab
2. Use the "Create Multiverse Model" section to create a custom model
3. Choose your preferred base model (must be already downloaded in Ollama)
4. Click "Create Model" and wait for the process to complete
5. Once created, select your new model from the dropdown in the Chat tab

Alternatively, you can use the included ModelFile.txt:

\`\`\`bash
# From the command line
cd /path/to/rtc-application
ollama create multiverse-rtc -f ./model/ModelFile.txt
\`\`\`

## Usage

1. Start the application and ensure Ollama is running
2. Click "Start Conversation" to begin
3. Speak your name when prompted
4. Ask questions or give commands using your voice
5. Click "Stop Listening" when you want to pause
6. Say "I'm done RTC" to end the conversation

### Voice Commands

- "Hey RTC" - Resume listening if paused
- "I'm done RTC" - End the conversation
- "What is the multiverse?" - Get information about the multiverse
- "Tell me about the Baron" - Learn about multiverse characters

## Application Structure

- `app/` - Next.js application pages
- `components/` - React components
- `utils/` - Utility functions
  - `ai.js` - Ollama API integration
  - `speech.js` - Speech recognition and synthesis
  - `multiverseData.js` - Multiverse dataset
  - `pretrainedData.js` - General knowledge data
  - `modelfileGenerator.js` - Custom model creation utilities
- `model/` - Contains the ModelFile.txt for direct model creation

## Troubleshooting

### Ollama Connection Issues

If you see "Ollama is not running" or connection errors:

1. Ensure Ollama is installed and running
2. Check that you have at least one model downloaded
3. Verify that Ollama is accessible at http://localhost:11434

### Speech Recognition Problems

If voice recognition isn't working:

1. Ensure you're using a supported browser (Chrome recommended)
2. Check that your microphone is working and permissions are granted
3. Try refreshing the page or restarting the browser

### Model Creation Failures

If model creation fails:

1. Ensure Ollama is running and has sufficient disk space
2. Verify that the base model is already downloaded
3. Try using a different base model or a simpler model name

## Development

To modify or extend RTC:

- Add new topics to `utils/pretrainedData.js`
- Extend the multiverse dataset in `utils/multiverseData.js`
- Modify the UI components in the `components/` directory
- Adjust speech settings in `utils/speech.js`

## License

[MIT License](LICENSE)

---

Created with ❤️ using Next.js, Ollama, and the power of local AI
