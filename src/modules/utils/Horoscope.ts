import { SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { load as cheerioLoad } from 'cheerio';
import { addModule } from "../index.js";
import { addCmd } from "../../lib/discord/registerCmds.js";
import { NEWLINE } from "../../utils/newline.js";

const SKY_HOROSCOPE_HOST = 'https://oroscopo.sky.it/oroscopo/giorno/{SIGN}.html';
const HTML_SELECTOR = '.c-article-section.j-article-section.c-article-section--secondary.l-spacing-m p';

export const HoroscopeModule = () => addModule("Horoscope", () => {
  addCmd({
    // @ts-expect-error Will be fixed in a newer version
    data: new SlashCommandBuilder()
      .setName("horoscope")
      .setDescription("Mostra l'oroscopo del giorno per il tuo segno")
      .addStringOption((option) => option
        .setName("sign")
        .setDescription("Segno zodiacale")
        .setRequired(true)
        .setChoices(
          { name: 'Ariete', value: 'ariete' },
          { name: 'Toro', value: 'toro' },
          { name: 'Gemelli', value: 'gemelli' },
          { name: 'Cancro', value: 'cancro' },
          { name: 'Leone', value: 'leone' },
          { name: 'Vergine', value: 'vergine' },
          { name: 'Bilancia', value: 'bilancia' },
          { name: 'Scorpione', value: 'scorpione' },
          { name: 'Sagittario', value: 'sagittario' },
          { name: 'Capricorno', value: 'capricorno' },
          { name: 'Acquario', value: 'acquario' },
          { name: 'Pesci', value: 'pesci' }
        )
      ),

    exec: async (interaction) => {
      const input = encodeURIComponent(interaction.options.data[0].value as string);
      await interaction.deferReply();

      // Get the horoscope HTML
      const { data: horoscopeHtml } = await axios(SKY_HOROSCOPE_HOST.replace('{SIGN}', input));

      // Extract the horoscope content from the HTML
      const $ = cheerioLoad(horoscopeHtml);
      const text = $(HTML_SELECTOR).text().trim();

      await interaction.editReply(`**OROSCOPO DEL GIORNO: ${input.toUpperCase()}**
\`\`\`
${text.replace(/\. /g, `.${NEWLINE}`)}
\`\`\``);
    }
  });
});
