import OpenAI from 'openai';

interface SummarizeParams {
  text: string;
}

export async function summarize(params: SummarizeParams): Promise<string> {
  const { text } = params;
  
  if (!text || text.trim().length === 0) {
    return "No text provided to summarize.";
  }
  
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that specializes in summarizing text. Create a concise summary that captures the main points.'
        },
        {
          role: 'user',
          content: `Please summarize the following text:\n\n${text}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });
    
    return response.choices[0].message.content || "Unable to generate summary.";
  } catch (error) {
    console.error('Error in summarize function:', error);
    throw new Error(`Summarization failed: ${error}`);
  }
}