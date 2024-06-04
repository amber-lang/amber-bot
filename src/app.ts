import { Client, Intents, CommandInteraction } from 'discord.js';
import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

        // Write the block to a temporary file
        const tempDir = path.join('~', 'amber-temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }
        const tempFilePath = path.join(tempDir, 'main.ab');
        fs.writeFileSync(tempFilePath, block);


        // Run the bash command in an isolated Docker container
        exec(`docker run --rm -v ${tempDir}:/scripts amber-alpine sh -c "amber /scripts/main.ab"`, (error, stdout, stderr) => {
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
