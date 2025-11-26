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
    },
    contact: async (msg, args) => {
        const contactId = args[0] ? (args[0].includes('@c.us') ? args[0] : `${args[0]}@c.us`) : (msg.mentionedIds[0] || msg.from);
        try {
            const contact = await client.getContactById(contactId);
            await msg.reply(contact);
        } catch (e) {
            await msg.reply('Could not fetch contact.');
        }
    },
    pfp: async (msg, args) => {
        const contactId = args[0] ? (args[0].includes('@c.us') ? args[0] : `${args[0]}@c.us`) : (msg.mentionedIds[0] || msg.from);
        try {
            const contact = await client.getContactById(contactId);
            const pfpUrl = await contact.getProfilePicUrl();
            if (pfpUrl) {
                await msg.reply(pfpUrl); // Or send as media if preferred
            } else {
                await msg.reply('No profile picture found.');
            }
        } catch (e) {
            await msg.reply('Could not fetch profile picture.');
        }
    },
    myprofile: async (msg) => {
        const info = client.info;
        await msg.reply(`
            *My Profile*
            Name: ${info.pushname}
            Number: ${info.wid.user}
            Platform: ${info.platform}
        `);
    }
};
