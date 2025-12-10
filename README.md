# Amber Bot

Amber Compiler bot that can run Amber code in the isolated environment.

## Commands

- `/run` - Run Amber code in the isolated environment.

## Configuration

- `TOKEN` - Amber Bot token.
- `APPLICATION_ID` - Amber Bot client ID.
- `GUILD_ID` - Amber Bot guild ID.

## Requirements

1. Build Docker images required for this bot.
```
amber build.ab
```
2. Register commands.
```
npm run register
```
3. Start the bot.
```
npm start
```
