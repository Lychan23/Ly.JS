
import { SlashCommandBuilder } from "discord.js"
import { SlashCommand } from "../types";

const rollCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("roll")
        .setDescription("Rolls a six-sided die and returns a number between 1 and 6")
    ,
    execute: async (interaction) => {
        const result = Math.floor(Math.random() * 6) + 1;
        await interaction.reply({ content: `🎲 You rolled a: ${result}` });
    },
    cooldown: 5
}

export default rollCommand;

