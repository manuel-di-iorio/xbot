import { SlashCommandBuilder, TextChannel } from "discord.js";
import moment from 'moment';
import 'moment-timezone';
import { addCmd } from "../../lib/discord/registerCmds.js";
import { parseNaturalDate } from "../../utils/parseNaturalDate.js";
import { randomBytes } from "crypto";
import { redis } from "../../lib/redis/index.js";

moment.locale('it');

export const setReminder = () => {
  addCmd({
    data: new SlashCommandBuilder()
      .setName("remind")
      .setDescription("Setta un reminder")
      .addStringOption((option) => option.setName("message").setDescription("Messaggio del reminder").setRequired(true))
      .addStringOption((option) => option.setName("when").setDescription("Quando inviare il reminder").setRequired(true))
      .addChannelOption((option) => option.setName("channel").setDescription("Canale in cui inviare il reminder (default: attuale)")),

    exec: async (interaction) => {
      const remindMsg = (interaction.options.get("message")?.value as string).trim();
      const optWhen = interaction.options.get("when")?.value as string;
      const channel = (interaction.options.get("channel")?.channel || interaction.channel) as TextChannel;
      const remindChannelId = channel?.id;

      // Parse the date
      let remindDate: Date | null = new Date(moment(optWhen, [
        'H', 'HH', 'H:mm', 'HH:mm', 'H:mm:ss', 'HH:mm:ss', 'DD/MM',
        'H:mm:ss D', 'HH:mm:ss D', 'HH:mm:ss DD',
        'H:mm:ss DD/MM', 'HH:mm:ss DD/MM', 'HH:mm:ss DD/M',
        'H:mm:ss DD/MM/YYYY', 'H:mm:ss D/MM/YYYY', 'HH:mm:ss D/MM/YYYY', 'HH:mm:ss DD/MM/YYYY',
        'HH:mm:ss DD/M/YYYY', 'H:mm:ss DD/M/YYYY', 'H:mm:ss D/M/YYYY', 'HH:mm:ss D/M/YYYY',
        'D/MM/YYYY', 'D/M/YYYY', 'DD/MM/YYYY'
      ], true).valueOf());

      if (!(remindDate instanceof Date) || isNaN(+remindDate)) {
        remindDate = parseNaturalDate(optWhen);
      }

      if (!remindDate) {
        await interaction.reply("Non ho capito la data");
        return;
      }

      // Date check
      const today = new Date();

      const todayTimestamp = today.getTime();
      const remindDateTime = remindDate.getTime();
      if (remindDateTime < todayTimestamp) {
        await interaction.reply('La data del reminder deve essere nel futuro');
        return;
      } else if (remindDateTime - todayTimestamp > 31536e6 * 10 /* 10 years (1 year multiplied 10) */) {
        await interaction.reply('La data massima è 10 anni');
        return;
      }

      // Save the reminder
      const reminderId = randomBytes(10).toString('hex');

      await redis.hset('reminders', reminderId, JSON.stringify({
        msg: remindMsg,
        exp: remindDate,
        chn: remindChannelId,
        usr: interaction.user.id
      }));

      // Tell the user of the success operation
      const prettyDate = moment(remindDate).format('DD MMMM YYYY [alle] HH:mm:ss');
      await interaction.reply(`✅ Reminder impostato! Te lo ricorderò nel canale <#${remindChannelId}> il ${prettyDate}`);
    }
  });
};
