import WebSocket from 'ws';
import http from 'http';

interface WSMessage {
  type: string;
  [key: string]: any;
}

class WebSocketServer {
  private server: http.Server;
  private wss: WebSocket.Server;
  private clients: Set<WebSocket>;

  constructor(port: number = 8080) {
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ server: this.server });
    this.clients = new Set();

    this.server.listen(port, () => {
      console.log(`WebSocket server listening on port ${port}`);
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('WebSocket client connected');
      this.clients.add(ws);

      ws.on('message', (message: string) => {
        console.log(`Received WebSocket message: ${message}`);
        try {
          const parsedMessage = JSON.parse(message);
          // Handle incoming WebSocket messages if needed
          console.log('Parsed WebSocket message:', parsedMessage);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      // Send a welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to WhatsApp AI Function Calling Bot'
      }));
    });
  }

  public broadcast(message: WSMessage): void {
    const messageStr = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
}

export function setupWebSocketServer(port: number = 8080): WebSocketServer {
  return new WebSocketServer(port);
}