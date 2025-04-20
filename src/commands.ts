import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { SlashCommandBuilder } from '@discordjs/builders';
import 'dotenv/config'

const commands = [
    new SlashCommandBuilder()
        .setName('run')
        .setDescription('Run a code block using amber')
        .addStringOption((opt) => opt
            .setName('bash-version')
            .setDescription('Bash version')
            .addChoices(
                { name: '5.2', value: '5.2' },
                { name: '5.1', value: '5.1' },
                { name: '5.0', value: '5.0' },
                { name: '4.4', value: '4.4' },
                { name: '4.3', value: '4.3' },
                { name: '4.2', value: '4.2' },
                { name: '4.1', value: '4.1' },
                { name: '4.0', value: '4.0' },
                { name: '3.2', value: '3.2' }
            )
        ),
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show help information')
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN ?? '');

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.APPLICATION_ID ?? '', process.env.GUILD_ID ?? ''),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
