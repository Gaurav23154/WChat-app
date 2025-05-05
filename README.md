# WhatsApp AI Function Calling Bot

A real-time WhatsApp chatbot that uses AI function calling to decide when to summarize text, translate content, or provide a direct response.

## Features

- WhatsApp integration using whatsapp-web.js
- WebSocket server for real-time communication
- AI-powered function calling with OpenAI
- Two main tools: summarize and translate
- TypeScript implementation with strict typing

## Architecture

The bot consists of four main components:

1. **WhatsApp Client**: Handles authentication and message I/O with WhatsApp Web
2. **WebSocket Server**: Provides a bridge for real-time communication
3. **AI Service**: Processes messages through OpenAI's function calling API
4. **Function Registry**: Manages available tools and their implementations

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- OpenAI API key

### Installation

1. Clone this repository
   ```
   git clone https://github.com/your-username/whatsapp-ai-function-bot.git
   cd whatsapp-ai-function-bot
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4-turbo
   WS_PORT=8080
   ```

### Running the Bot

```
npm run dev
```

The first time you run the bot, you'll need to scan a QR code to authenticate with WhatsApp. After scanning, your session will be saved locally, so you won't need to scan again unless you log out.

## How It Works

### Message Flow

1. A message arrives in WhatsApp
2. The message is sent to the WebSocket server
3. The AI processes the message and decides whether to:
   - Call the `summarize` function
   - Call the `translate` function
   - Reply directly
4. The selected function is executed (if any)
5. The result is sent back to both WhatsApp and the WebSocket clients

### Function Calling Logic

The AI makes decisions based on the message content:

- Messages starting with "summarize:" trigger the summarize function
- Messages starting with "translate to [lang]:" trigger the translate function
- Other messages receive direct AI responses or a fallback message

The schema for each function is defined in TypeScript and passed to the OpenAI API, which automatically parses and fills the parameters based on the user's message.

## Testing

To test the bot, send the following messages on WhatsApp:

1. **Summarization**: "summarize: [paste a long text here]"
2. **Translation**: "translate to fr: Hello, how are you today?"
3. **Direct response**: "What is the capital of France?"

## License

MIT