import { FunctionDefinition } from '../types/translate';
import { summarize } from './summarize';
import { translate } from './translate';

export class FunctionRegistry {
  private functions: Map<string, Function>;
  private definitions: FunctionDefinition[];

  constructor() {
    this.functions = new Map();
    this.definitions = [];

    // Register summarize function
    this.registerFunction({
      name: 'summarize',
      description: 'Summarizes a given text into a concise version',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The text to summarize'
          }
        },
        required: ['text']
      },
      implementation: summarize
    });

    // Register translate function
    this.registerFunction({
      name: 'translate',
      description: 'Translates text to the specified target language',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The text to translate'
          },
          targetLang: {
            type: 'string',
            description: 'The ISO language code of the target language (e.g., "fr" for French, "es" for Spanish)'
          }
        },
        required: ['text', 'targetLang']
      },
      implementation: translate
    });
  }

  registerFunction(config: FunctionDefinition & { implementation: Function }): void {
    const { name, implementation, ...definition } = config;
    
    this.functions.set(name, implementation);
    this.definitions.push({ name, ...definition });
  }

  getFunctionDefinitions(): FunctionDefinition[] {
    return this.definitions;
  }

  async executeFunction(name: string, args: any): Promise<string> {
    const func = this.functions.get(name);
    
    if (!func) {
      throw new Error(`Function "${name}" not found`);
    }
    
    try {
      return await func(args);
    } catch (error) {
      console.error(`Error executing function "${name}":`, error);
      throw new Error(`Failed to execute function "${name}": ${error}`);
    }
  }
}