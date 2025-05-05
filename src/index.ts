import dotenv from 'dotenv';
import { setupWhatsAppClient } from './whatsapp/client';
import { setupWebSocketServer } from './websocket/server';
import { AIService } from './ai/service';
import { FunctionRegistry } from './functions/registry';

// Load environment variables
dotenv.config();

async function main() {
  try {
    console.log('Starting WhatsApp AI Function Calling Bot...');
    
    // Initialize function registry with available tools
    const functionRegistry = new FunctionRegistry();
    
    // Initialize AI service with function definitions
    const aiService = new AIService(functionRegistry.getFunctionDefinitions());
    
    // Setup WebSocket server
    const wsServer = setupWebSocketServer();
    console.log('WebSocket server running');
    
    // Setup WhatsApp client
    const whatsappClient = await setupWhatsAppClient();
    console.log('WhatsApp client authenticated');
    
    // Wire up the message flow: WhatsApp -> WebSocket -> AI -> Function -> WebSocket -> WhatsApp
    whatsappClient.on('message', async (message) => {
      const text = message.body;
      const chatId = message.from;
      
      console.log(`Received message from ${chatId}: ${text}`);
      
      // Send to WebSocket clients
      wsServer.broadcast({
        type: 'incoming',
        chatId,
        text
      });
      
      try {
        // Process with AI to determine function call
        const aiResponse = await aiService.processMessage(text);
        
        if (aiResponse.functionCall) {
          // AI decided to call a function
          const { name, arguments: args } = aiResponse.functionCall;
          console.log(`AI selected function: ${name} with args:`, args);
          
          // Execute the function
          const functionResult = await functionRegistry.executeFunction(name, args);
          
          // Send result back to WhatsApp
          await whatsappClient.sendMessage(chatId, functionResult);
          
          // Broadcast to WebSocket
          wsServer.broadcast({
            type: 'function_result',
            chatId,
            functionName: name,
            result: functionResult
          });
        } else {
          // AI responded directly
          const response = aiResponse.content || "I'm not sure how to help with that request.";
          
          // Send AI response back to WhatsApp
          await whatsappClient.sendMessage(chatId, response);
          
          // Broadcast to WebSocket
          wsServer.broadcast({
            type: 'ai_response',
            chatId,
            response
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
        await whatsappClient.sendMessage(chatId, "Sorry, I encountered an error processing your request.");
        
        wsServer.broadcast({
          type: 'error',
          error: String(error)
        });
      }
    });
    
    console.log('Bot is now running and listening for messages.');
  } catch (error) {
    console.error('Failed to start the bot:', error);
    process.exit(1);
  }
}

main();