import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import Canvas from 'canvas';
import { addModule } from "../index.js";
import { addCmd } from "../../lib/discord/registerCmds.js";

export const ColorModule = () => addModule("Color", () => {
  addCmd({
    // @ts-expect-error Will be fixed in a newer version
    data: new SlashCommandBuilder()
      .setName("color")
      .setDescription("Mostra il colore indicato")
      .addStringOption((option) => option.setName("color").setDescription("Colore da mostrare in formato #rrggbb").setRequired(true)),

    exec: async (interaction) => {
      let input = interaction.options.data[0].value as string;
      if (input[0] !== '#') input = '#' + input;

      if (!/^#[0-9A-F]{6}$/i.test(input)) {
        await interaction.reply('Non hai indicato un colore corretto. Scrivi /color #rrggbb per mostrare un colore');
        return;
      }

      await interaction.deferReply();

      // Create the colored image
      const canvas = Canvas.createCanvas(64, 50);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = input;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'color.png' });
      await interaction.editReply({ files: [attachment] });
    }
  });
});
