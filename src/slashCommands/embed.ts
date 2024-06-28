import { SlashCommandBuilder, TextChannel, EmbedBuilder, ColorResolvable, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Create a new embed message.")
    .addStringOption(option => 
      option
        .setName("title")
        .setDescription("Title of the embed message")
        .setRequired(true)
    )
    .addStringOption(option => 
      option
        .setName("description")
        .setDescription("Description of the embed message.")
        .setRequired(true)
    )
    .addChannelOption(option => 
      option
        .setName("channel")
        .setDescription("Text channel where the embed message will be sent.")
        .setRequired(true)
    )
    .addStringOption(option => 
      option
        .setName("color")
        .setDescription("Select an option or type a hex color, for example: #000000")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  autocomplete: async (interaction: AutocompleteInteraction) => {
    try {
      const focusedValue = interaction.options.getFocused();
      const choices = [
        { name: "White", value: "WHITE" },
        { name: "Aqua", value: "AQUA" },
        { name: "Green", value: "GREEN" },
        { name: "Blue", value: "BLUE" },
        { name: "Yellow", value: "YELLOW" },
        { name: "Purple", value: "PURPLE" },
        { name: "LuminousVividPink", value: "LUMINOUS_VIVID_PINK" },
        { name: "Fuchsia", value: "FUCHSIA" },
        { name: "Gold", value: "GOLD" },
        { name: "Orange", value: "ORANGE" },
        { name: "Red", value: "RED" },
        { name: "Grey", value: "GREY" },
        { name: "Navy", value: "NAVY" },
        { name: "DarkAqua", value: "DARK_AQUA" },
        { name: "DarkGreen", value: "DARK_GREEN" },
        { name: "DarkBlue", value: "DARK_BLUE" },
        { name: "DarkPurple", value: "DARK_PURPLE" },
        { name: "DarkVividPink", value: "DARK_VIVID_PINK" },
        { name: "DarkGold", value: "DARK_GOLD" },
        { name: "DarkOrange", value: "DARK_ORANGE" },
        { name: "DarkRed", value: "DARK_RED" },
        { name: "DarkGrey", value: "DARK_GREY" },
        { name: "DarkerGrey", value: "DARKER_GREY" },
        { name: "LightGrey", value: "LIGHT_GREY" },
        { name: "DarkNavy", value: "DARK_NAVY" }
      ];

      const filtered = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase()));
      await interaction.respond(filtered.map(choice => ({ name: choice.name, value: choice.value })));
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  },

  execute: async (interaction: ChatInputCommandInteraction) => {
    try {
      await interaction.deferReply({ ephemeral: true });

      const title = interaction.options.getString("title", true);
      const description = interaction.options.getString("description", true);
      const channel = interaction.options.getChannel("channel", true) as TextChannel;
      const color = interaction.options.getString("color", true) as ColorResolvable;

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setAuthor({ name: interaction.client.user?.username || 'Default Name', iconURL: interaction.client.user?.avatarURL() || undefined })
        .setThumbnail(interaction.client.user?.avatarURL() || null)
        .setTimestamp()
        .setFooter({ text: "Test embed message", iconURL: interaction.client.user?.avatarURL() || undefined });

      await channel.send({ embeds: [embed] });
      await interaction.editReply({ content: "Embed message successfully sent." });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      await interaction.editReply({ content: "Something went wrong..." });
    }
  },

  cooldown: 10
};

export default command;
