import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { FunctionDefinition } from '../types/translate';

interface AIResponse {
  content: string | null;
  functionCall: {
    name: string;
    arguments: any;
  } | null;
}

export class AIService {
  private openai: OpenAI;
  private functionDefinitions: FunctionDefinition[];
  private model: string;

  constructor(functionDefinitions: FunctionDefinition[]) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable not set');
    }

    this.openai = new OpenAI({ apiKey });
    this.functionDefinitions = functionDefinitions;
    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo';
  }

  async processMessage(userMessage: string): Promise<AIResponse> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are a helpful assistant that can summarize text or translate it to different languages. 
                    If a user asks you to summarize text, call the summarize function. 
                    If a user asks you to translate text, call the translate function with the appropriate target language.
                    If the user's request doesn't clearly match summarization or translation, respond directly to their query.
                    Messages that start with "summarize:" should be processed with the summarize function.
                    Messages that start with "translate to [language code]:" should be processed with the translate function.`
        },
        { role: 'user', content: userMessage }
      ];

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        tools: this.functionDefinitions.map(def => ({
          type: 'function',
          function: {
            name: def.name,
            description: def.description,
            parameters: def.parameters
          }
        })),
        tool_choice: 'auto'
      });

      const responseMessage = response.choices[0].message;
      
      // Check if the AI decided to call a function
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        const toolCall = responseMessage.tool_calls[0];
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        return {
          content: null,
          functionCall: {
            name: functionName,
            arguments: functionArgs
          }
        };
      }
      
      // AI chose to respond directly
      return {
        content: responseMessage.content || "I'm not sure how to help with that.",
        functionCall: null
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error(`Failed to process message with AI: ${error}`);
    }
  }
}