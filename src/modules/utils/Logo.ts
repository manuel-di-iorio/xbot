import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import { addModule } from "../index.js";
import { addCmd } from "../../lib/discord/registerCmds.js";
import { readFile } from "fs/promises";

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

      const guildImageUrl = interaction.guild.iconURL({ extension: 'png', size: 512 }) || "Logo non trovato";
      const svgFile = await readFile("./assets/gmi_logo.svg");
      const svgAttachment = new AttachmentBuilder(svgFile, { name: "gmi_logo.svg" });
      await interaction.reply({ files: [guildImageUrl, svgAttachment] });
    }
  });
});
