import { SlashCommandBuilder } from "discord.js";
import { addModule } from "../index.js";
import { addCmd } from "../../lib/discord/registerCmds.js";

export const LogoModule = () => addModule("Logo", () => {
  addCmd({
    data: new SlashCommandBuilder()
      .setName("logo")
      .setDescription("Mostra il logo del server"),

    exec: async (interaction) => {
      if (!interaction.guild) {
        await interaction.reply("Usa questo comando in un server");
        return;
      }

      await interaction.reply(interaction.guild.iconURL({ extension: 'png', size: 512 }) || "Logo non trovato");
    }
  });
});
