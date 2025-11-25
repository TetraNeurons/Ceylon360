const client = require('../client');

module.exports = {
    ping: async (msg) => {
        await msg.reply('pong');
    },
    info: async (msg) => {
        const info = client.info;
        await client.sendMessage(msg.from, `
            *Connection info*
            User name: ${info.pushname}
            My number: ${info.wid.user}
            Platform: ${info.platform}
        `);
    },
    echo: async (msg, args) => {
        const text = args.join(' ');
        await msg.reply(text);
    }
};
