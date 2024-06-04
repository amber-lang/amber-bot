import { Client, Intents, CommandInteraction } from 'discord.js';
import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const sessions: { [key: string]: boolean } = {};
const TIME = 10;

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.MESSAGE_CONTENT]
});

client.once('ready', () => {
    console.log(`Bot is ready. Logged in as ${client.user?.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, user } = interaction;

    if (commandName === 'run') {
        sessions[user.id] = true;
        await interaction.reply({ content: 'Please enter your code block.', ephemeral: true });
    }
});

client.on('messageCreate', async message => {
    const user = message.author;
    const content = message.content.trim();

    if (sessions[user.id]) {
        // Check if the message contains a code block
        const codeBlockMatch = content.match(/```(?:\w*\n)?([\s\S]*?)```/);
        if (codeBlockMatch) {
            const block = codeBlockMatch[1]; // Extract the code block content
            delete sessions[user.id];
            // Write the block to a temporary file
            const tempDir = path.join(__dirname, 'amber-temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }
            const tempFilePath = path.join(tempDir, 'main.ab');
            fs.writeFileSync(tempFilePath, block);

            const containerName = `amber_container_${Date.now()}`;

            // Run the bash command in an isolated Docker container
            exec(`docker run --name ${containerName} --rm -v ${tempDir}:/scripts amber-alpine sh -c "amber /scripts/main.ab"`, (error, stdout, stderr) => {
                // Send the result back to the user
                if (error) {
                    message.reply(`Error:\n\`\`\`\n${stderr}\n\`\`\``);
                } else {
                    if (!stdout.length) {
                        message.reply('No output.');
                    } else {
                        message.reply(`\`\`\`\n${stdout}\n\`\`\``);
                    }
                }
                // Clean up the temporary file
                fs.unlinkSync(tempFilePath);
            });

            setTimeout(() => {
                exec(`docker stop ${containerName}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Failed to stop container ${containerName}: ${stderr}`);
                    } else {
                        console.log(`Container ${containerName} stopped due to timeout.`);
                        message.reply(`Execution time exceeded ${TIME} seconds and was stopped.`);
                    }
                });
            }, TIME * 1000);
        } else {
            message.reply('Please provide a valid code block wrapped in triple backticks.');
        }
    }
});

client.login(process.env.TOKEN);
