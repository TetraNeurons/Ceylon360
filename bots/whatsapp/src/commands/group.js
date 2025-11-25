const client = require('../client');

module.exports = {
    creategroup: async (msg, args) => {
        // Usage: !creategroup Title number1 number2 ...
        const title = args.shift();
        const participants = args.map(num => num.includes('@c.us') ? num : `${num}@c.us`);

        try {
            await client.createGroup(title, participants);
            await msg.reply(`Created group "${title}"`);
        } catch (error) {
            console.error(error);
            await msg.reply('Failed to create group.');
        }
    },
    join: async (msg, args) => {
        const inviteCode = args[0];
        try {
            await client.acceptInvite(inviteCode);
            await msg.reply('Joined the group!');
        } catch (e) {
            await msg.reply('Invalid invite code.');
        }
    },
    leave: async (msg) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            await chat.leave();
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    },
    subject: async (msg, args) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            const newSubject = args.join(' ');
            await chat.setSubject(newSubject);
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    },
    desc: async (msg, args) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            const newDesc = args.join(' ');
            await chat.setDescription(newDesc);
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    },
    addmembers: async (msg, args) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            const participants = args.map(num => num.includes('@c.us') ? num : `${num}@c.us`);
            await chat.addParticipants(participants);
            await msg.reply('Tried to add participants.');
        } else {
            await msg.reply('This command can only be used in a group!');
        }
    }
};
