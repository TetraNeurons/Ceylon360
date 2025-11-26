const client = require('../client');

module.exports = {
    mute: async (msg) => {
        const chat = await msg.getChat();
        // Mute for 7 days (default example)
        const unmuteDate = new Date();
        unmuteDate.setDate(unmuteDate.getDate() + 7);
        await chat.mute(unmuteDate);
        await msg.reply('Chat muted for 7 days.');
    },
    unmute: async (msg) => {
        const chat = await msg.getChat();
        await chat.unmute();
        await msg.reply('Chat unmuted.');
    },
    clear: async (msg) => {
        const chat = await msg.getChat();
        await chat.clearMessages();
        await msg.reply('Chat cleared.');
    },
    delete: async (msg) => {
        const chat = await msg.getChat();
        await chat.delete();
        // Can't reply after deleting the chat
    },
    block: async (msg, args) => {
        const contactId = args[0] ? (args[0].includes('@c.us') ? args[0] : `${args[0]}@c.us`) : (msg.mentionedIds[0] || (msg.hasQuotedMsg ? (await msg.getQuotedMessage()).author : null));
        if (contactId) {
            const contact = await client.getContactById(contactId);
            await contact.block();
            await msg.reply('Contact blocked.');
        } else {
            await msg.reply('Please mention a user or quote a message to block.');
        }
    },
    unblock: async (msg, args) => {
        const contactId = args[0] ? (args[0].includes('@c.us') ? args[0] : `${args[0]}@c.us`) : (msg.mentionedIds[0] || (msg.hasQuotedMsg ? (await msg.getQuotedMessage()).author : null));
        if (contactId) {
            const contact = await client.getContactById(contactId);
            await contact.unblock();
            await msg.reply('Contact unblocked.');
        } else {
            await msg.reply('Please mention a user or quote a message to unblock.');
        }
    }
};
