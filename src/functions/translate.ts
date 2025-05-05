import OpenAI from 'openai';

interface TranslateParams {
  text: string;
  targetLang: string;
}

export async function translate(params: TranslateParams): Promise<string> {
  const { text, targetLang } = params;
  
  if (!text || text.trim().length === 0) {
    return "No text provided to translate.";
  }
  
  if (!targetLang || targetLang.trim().length === 0) {
    return "No target language specified for translation.";
  }
  
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that specializes in language translation. 
                   Translate the provided text to ${targetLang} language. 
                   Only return the translated text with no additional commentary.`
        },
        {
          role: 'user',
          content: `Please translate the following text to ${targetLang}:\n\n${text}`
        }
      ],
      temperature: 0.3
    });
    
    return response.choices[0].message.content || "Unable to translate text.";
  } catch (error) {
    console.error('Error in translate function:', error);
    throw new Error(`Translation failed: ${error}`);
  }
}