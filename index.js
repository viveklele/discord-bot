const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const {token} = require('./config.json');
const { CLIENT_RENEG_WINDOW } = require('node:tls');

const client = new Client({intents : [GatewayIntentBits.Guilds]})
client.commands = new Collection();

const folderPath = path.join(__dirname, 'commands');
const commandFolder = fs.readSync(folderPath);

for(const folder of commandFolder){
    const commandsPath = path.join(folderPath);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.command.set(command.data.name, command);
        } else {
            console.log(`[Warning] the commant at ${filePath} is missing a require 'data' or 'execute' property`);
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	
    const command = interaction.client.commands.get(interaction.commandName);

    if(!command){
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try{
        await command.execute(interaction);
    } catch(error){
        console.error(error);
        if(interaction.reply || interaction.deferred){
            await interaction.followUp({content: 'There was error while execution this command', ephemeral: true});
        } else{
            await interaction.reply({content: 'There was an error while execution this command', ephemeral: true});
        }
    }

});
client.login(token);