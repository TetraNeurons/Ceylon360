const config = require('../config');

// Import command modules
const generalCommands = require('../commands/general');
const groupCommands = require('../commands/group');
const mediaCommands = require('../commands/media');
const miscCommands = require('../commands/misc');

module.exports = {
    init: (client) => {
        client.on('message', async msg => {
            // console.log('MESSAGE RECEIVED', msg.body);

            if (!msg.body.startsWith(config.prefix)) return;

            const args = msg.body.slice(config.prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            try {
                switch (command) {
                    // General
                    case 'ping': await generalCommands.ping(msg); break;
                    case 'info': await generalCommands.info(msg); break;
                    case 'echo': await generalCommands.echo(msg, args); break;

                    // Group
                    case 'creategroup': await groupCommands.creategroup(msg, args); break;
                    case 'join': await groupCommands.join(msg, args); break;
                    case 'leave': await groupCommands.leave(msg); break;
                    case 'subject': await groupCommands.subject(msg, args); break;
                    case 'desc': await groupCommands.desc(msg, args); break;
                    case 'addmembers': await groupCommands.addmembers(msg, args); break;

                    // Media
                    case 'mediainfo': await mediaCommands.mediainfo(msg); break;
                    case 'resendmedia': await mediaCommands.resendmedia(msg); break;
                    case 'isviewonce': await mediaCommands.isviewonce(msg); break;

                    // Misc
                    case 'location': await miscCommands.location(msg); break;
                    case 'status': await miscCommands.status(msg, args); break;
                    case 'mentionusers': await miscCommands.mentionusers(msg); break;
                    case 'mentiongroups': await miscCommands.mentiongroups(msg); break;

                    default:
                        // console.log('Unknown command');
                        break;
                }
            } catch (error) {
                console.error('Error executing command:', error);
                await msg.reply('An error occurred while executing the command.');
            }
        });
    }
};
