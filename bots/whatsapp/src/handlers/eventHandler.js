const qrcode = require('qrcode-terminal');
const client = require('../client');

module.exports = {
    init: () => {
        client.on('qr', (qr) => {
            console.log('QR RECEIVED. Scan this with your WhatsApp app:');
            qrcode.generate(qr, { small: true });
        });

        client.on('ready', () => {
            console.log('Client is ready!');
        });

        client.on('authenticated', () => {
            console.log('AUTHENTICATED');
        });

        client.on('auth_failure', msg => {
            console.error('AUTHENTICATION FAILURE', msg);
        });

        client.on('loading_screen', (percent, message) => {
            console.log('LOADING SCREEN', percent, message);
        });

        client.on('disconnected', (reason) => {
            console.log('Client was logged out', reason);
        });
    }
};
