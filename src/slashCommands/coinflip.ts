
import { SlashCommandBuilder } from "discord.js"
import { SlashCommand } from "../types";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Flips a coin and returns either Heads or Tails")
    ,
    execute: async (interaction) => {
        const result = Math.random() < 0.5 ? "Heads" : "Tails";
        await interaction.reply({ content: `🪙 The coin landed on: ${result}` });
    },
    cooldown: 5
}

export default command;

