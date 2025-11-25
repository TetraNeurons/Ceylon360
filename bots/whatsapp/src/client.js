const { Client } = require('whatsapp-web.js');
const config = require('./config');

const client = new Client({
    authStrategy: config.authStrategy,
    puppeteer: config.puppeteer
});

module.exports = client;
