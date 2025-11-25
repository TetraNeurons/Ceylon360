const { LocalAuth } = require('whatsapp-web.js');

module.exports = {
    // Auth strategy: LocalAuth stores the session locally so you don't have to scan QR every time
    authStrategy: new LocalAuth({
        clientId: "whatsapp-bot-session"
    }),

    // Puppeteer launch options
    puppeteer: {
        executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", // Verify this path on your system
        headless: true, // Set to true for production/headless environment
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu",
            "--window-size=1280,720",
        ],
        defaultViewport: null,
    },


    // Bot prefix for commands
    prefix: '!'
};