import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

export async function setupWhatsAppClient(): Promise<Client> {
  // Initialize WhatsApp client with local authentication
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
  });

  // Register event handlers
  client.on('qr', (qr) => {
    console.log('QR Code received, scan to authenticate:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('WhatsApp client is ready');
  });

  client.on('authenticated', () => {
    console.log('WhatsApp client authenticated');
  });

  client.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failed:', msg);
  });

  client.on('disconnected', (reason) => {
    console.log('WhatsApp client disconnected:', reason);
    process.exit(1);
  });

  // Initialize the client
  await client.initialize();
  return client;
}