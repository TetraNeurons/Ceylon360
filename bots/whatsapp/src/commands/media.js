const client = require('../client');

module.exports = {
    mediainfo: async (msg) => {
        if (msg.hasMedia) {
            const attachmentData = await msg.downloadMedia();
            await msg.reply(`
                *Media info*
                MimeType: ${attachmentData.mimetype}
                Filename: ${attachmentData.filename}
                Data (length): ${attachmentData.data.length}
            `);
        } else {
            await msg.reply('This message does not contain media.');
        }
    },
    resendmedia: async (msg) => {
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            if (quotedMsg.hasMedia) {
                const attachmentData = await quotedMsg.downloadMedia();
                await client.sendMessage(msg.from, attachmentData, { caption: 'Here\'s your requested media.' });
            } else {
                await msg.reply('Quoted message does not have media.');
            }
        } else {
            await msg.reply('Please quote a message with media.');
        }
    },
    isviewonce: async (msg) => {
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            if (quotedMsg.hasMedia) {
                const media = await quotedMsg.downloadMedia();
                await client.sendMessage(msg.from, media, { isViewOnce: true });
            } else {
                await msg.reply('Quoted message does not have media.');
            }
        } else {
            await msg.reply('Please quote a message with media.');
        }
    }
};
