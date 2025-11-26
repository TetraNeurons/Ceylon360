const { Poll } = require('whatsapp-web.js');

module.exports = {
    react: async (msg, args) => {
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            const emoji = args[0] || '👍';
            await quotedMsg.react(emoji);
        } else {
            await msg.reply('Please quote a message to react to.');
        }
    },
    poll: async (msg, args) => {
        // Usage: !poll Question Option1 Option2 ...
        const question = args.shift();
        const options = args;

        if (options.length < 2) {
            await msg.reply('Please provide at least 2 options.');
            return;
        }

        try {
            const poll = new Poll(question, options);
            await msg.reply(poll);
        } catch (e) {
            console.error(e);
            await msg.reply('Failed to create poll. Ensure you are using a supported version.');
        }
    }
};
