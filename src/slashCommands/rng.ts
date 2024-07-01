
import { SlashCommandBuilder } from "discord.js"
import { SlashCommand } from "../types";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("rng")
        .setDescription("Generates a random number between 1 and 10,000,000,000")
    ,
    execute: async (interaction) => {
        const randomNumber = Math.floor(Math.random() * 10000000000) + 1;  // Generate random number between 1 and 10,000,000,000
        await interaction.reply({ content: `🎲 Your random number is: ${randomNumber}` });
    },
    cooldown: 5
}

export default command;

