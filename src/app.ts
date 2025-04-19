import { Client, Intents } from 'discord.js';
import 'dotenv/config'
import { BashVersion, startCodeRunner } from './runner';

const sessions: { [key: string]: { version?: BashVersion } } = {};

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.MESSAGE_CONTENT]
});

client.once('ready', () => {
    console.log(`Bot is ready. Logged in as ${client.user?.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, user, options } = interaction;

    if (commandName === 'run') {
        const version = options.getString('bash-version');
        sessions[user.id] = { version: version as BashVersion };
        const versionReply = version ? `Version ${version} selected. ` : '';
        await interaction.reply({ content: versionReply + 'Please enter your code block.', ephemeral: true });
    }
});

client.on('messageCreate', async message => {
    const user = message.author;
    const content = message.content.trim();

    if (sessions[user.id]) {
        // Check if the message contains a code block
        const codeBlockMatch = content.match(/```(?:\w*\n)?([\s\S]*?)```/);
        const isBash = /^```(bash|sh|shell)/.test(content);
        if (codeBlockMatch) {
            const block = codeBlockMatch[1];
            const { version } = sessions[user.id];
            delete sessions[user.id];
            const result = await startCodeRunner({
                code: block,
                lang: isBash ? 'bash' : 'amber',
                version: version || '5.2'
            })
            result.match(
                (ok) => message.reply(ok),
                (err) => message.reply(err)
            );
        } else {
            message.reply('Please provide a valid code block wrapped in triple backticks.');
        }
    }
});

client.login(process.env.TOKEN);
