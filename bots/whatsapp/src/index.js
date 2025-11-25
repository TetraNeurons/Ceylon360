const client = require('./client');
const eventHandler = require('./handlers/eventHandler');
const messageHandler = require('./handlers/messageHandler');

// Initialize handlers
eventHandler.init();
messageHandler.init(client);

// Start the client
console.log('Initializing client...');
client.initialize();
