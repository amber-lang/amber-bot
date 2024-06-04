import { Client, Intents, CommandInteraction } from 'discord.js';
import { exec } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.MESSAGE_CONTENT]
});

client.once('ready', () => {
    console.log(`Bot is ready. Logged in as ${client.user?.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'run') {
        const block = options.getString('block');
        if (!block) {
            await interaction.reply('Please provide a code block to run.');
            return;
        }

        // Run the bash command in an isolated Docker container
        exec(`docker run --rm amber-alpine sh -c "amber -e \\"${block}\\""`, (error, stdout, stderr) => {
            // Send the result back to the user
            if (error) {
                interaction.reply(`Error:\n\`\`\`\n${stderr}\n\`\`\``);
            } else {
                interaction.reply(`\`\`\`\n${stdout}\n\`\`\``);
            }
        });
    }
});

client.login(process.env.TOKEN);
