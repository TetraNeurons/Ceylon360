const { Location } = require('whatsapp-web.js');
const client = require('../client');

module.exports = {
    location: async (msg) => {
        await msg.reply(new Location(37.422, -122.084, { name: 'Googleplex', address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA' }));
    },
    status: async (msg, args) => {
        const newStatus = args.join(' ');
        await client.setStatus(newStatus);
        await msg.reply(`Status was updated to *${newStatus}*`);
    },
    mentionusers: async (msg) => {
        const chat = await msg.getChat();
        // Example: mentions the sender
        await chat.sendMessage(`Hi @${msg.author || msg.from}`, {
            mentions: [msg.author || msg.from]
        });
    },
    mentiongroups: async (msg) => {
        // This requires known group IDs, for demo purposes we'll just log or reply
        await msg.reply('This feature requires specifying group IDs in the code.');
    }
};
