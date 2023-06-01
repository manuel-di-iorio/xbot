import { EmbedBuilder } from "discord.js";
import { QueueTask } from "../type.js";
import { broadcastEmbed } from "../../../utils/embeds.js";
import { DOUBLE_NEWLINE } from "../../../utils/newline.js";

export const SendPrimeReminderTask: QueueTask = {
  name: 'prime-reminder',
  cron: '0 21 14,28 * *', // At 21:00 on day-of-month 14 and 28
  exec: async () => {
    const embed = new EmbedBuilder()
      .setColor('#6441a5') // Purple
      .setTitle("Supporta GMI ❤️")
      .setURL("https://www.twitch.tv/gamemakeritalia")
      .setDescription(`Per dare un contributo a **GMI**, ricorda di fare la sub ogni mese al canale Twitch https://www.twitch.tv/gamemakeritalia.${DOUBLE_NEWLINE}Se hai Amazon Prime, la sub è **gratuita**, ti basta collegare il tuo account a Twitch da qui: https://gaming.amazon.com/links/twitch/manage`)
      .setThumbnail("https://i.imgur.com/9969GCG.png");

    await broadcastEmbed(embed);
  }
};
