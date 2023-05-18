import { SlashCommandBuilder, Snowflake } from "discord.js";
import moment from "moment";
import { addCmd } from "../../lib/discord/registerCmds.js";
import { redis } from "../../lib/redis/index.js";
import { client } from "../../lib/discord/index.js";
import { Reminder } from "../../lib/scheduler/tasks/sendReminders.js";
import { getUserDisplayName } from "../../utils/getUserDisplayName.js";

const hasKey = Object.prototype.hasOwnProperty.call.bind(Object);

export const listReminders = () => {
  addCmd({
    data: new SlashCommandBuilder()
      .setName("remind_list")
      .setDescription("Mostra i reminder impostati"),

    exec: async (interaction) => {
      const reminders = await redis.hgetall('reminders');
      if (!reminders || !Object.keys(reminders).length) {
        await interaction.reply('Non ci sono reminders salvati');
        return;
      }

      let remindersText = '';
      for (const id in reminders) {
        if (!hasKey(reminders, id)) continue;

        // Parse the reminder content
        const reminder: Reminder = JSON.parse(reminders[id]);

        // Get the user
        const user = client.users.cache.get(reminder.usr as Snowflake);
        const prettyDate = moment(new Date(reminder.exp)).format('DD/MM/YYYY [alle] HH:mm:ss');

        remindersText += `\`\`\`Creato da ${getUserDisplayName(interaction, user?.id)} con scadenza ${prettyDate} (ID: ${id}) 
‟${reminder.msg}”
\`\`\`
`;
      }

      await interaction.reply(`Lista dei reminders:    
${remindersText}`);
    }
  });
};
