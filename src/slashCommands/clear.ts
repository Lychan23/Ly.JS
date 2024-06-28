import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

const ClearCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Deletes messages from the current channel.")
    .addIntegerOption(option =>
      option
        .setMaxValue(100)
        .setMinValue(1)
        .setName("messagecount")
        .setDescription("Message amount to be cleared")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages) as unknown as SlashCommandBuilder,
  execute: async interaction => {
    const messageCount = interaction.options.getInteger("messagecount");
    if (interaction.channel?.type === ChannelType.DM) return;

    try {
      const messages = await interaction.channel?.messages.fetch({ limit: messageCount! });
      if (!messages) {
        await interaction.reply("No messages were found.");
        return;
      }

      const deletedMessages = await interaction.channel?.bulkDelete(messages, true);
      if (!deletedMessages || deletedMessages.size === 0) {
        await interaction.reply("No messages were deleted.");
      } else {
        await interaction.reply(`Successfully deleted ${deletedMessages.size} message(s).`);
      }
    } catch (error) {
      console.error("Error deleting messages:", error);
      await interaction.reply("There was an error while trying to delete messages.");
    }

    setTimeout(() => interaction.deleteReply(), 5000);
  },
  cooldown: 10
};

export default ClearCommand;
