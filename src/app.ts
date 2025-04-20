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

    switch (commandName) {
        case 'run': {
            const version = options.getString('bash-version');
            sessions[user.id] = { version: version as BashVersion };
            const versionReply = version ? `Version ${version} selected. ` : '';
            await interaction.reply({ content: versionReply + 'Please enter your code block.', ephemeral: true });
        }
        case 'help': {
            interaction.reply({ content: [
                '`/run` - Executes Amber or Bash scripts in a custom Bash environment. After entering the command, paste your code inside a Markdown code block (triple backticks) and send it to run.',
                '`/help` - Displays this message'
            ].join('\n'), ephemeral: true });
        }
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
            const bashVersion = version || '5.2';
            delete sessions[user.id];
            const result = await startCodeRunner({
                code: block,
                lang: isBash ? 'bash' : 'amber',
                version: bashVersion
            })
            const response = (msg: string) => `-# language ${isBash ? '<:bashfile:1247579804434432061>' : '<:amber:1247579334701617302>'} |  bash version \`${bashVersion}\`\n${msg}`
            result.match(
                (ok: string) => message.reply(response(ok)),
                (err: string) => message.reply(response(err))
            );
        } else {
            message.reply('Please provide a valid code block wrapped in triple backticks.');
        }
    }
});

client.login(process.env.TOKEN);
