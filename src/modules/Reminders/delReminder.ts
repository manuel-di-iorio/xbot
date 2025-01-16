import { SlashCommandBuilder } from "discord.js";
import { addCmd } from "../../lib/discord/registerCmds.js";
import { redis } from "../../lib/redis/index.js";

export const delReminder = () => {
  addCmd({
    // @ts-expect-error Will be fixed in a newer version
    data: new SlashCommandBuilder()
      .setName("remind_del")
      .setDescription("Cancella un reminder")
      .addStringOption((option) => option.setName("id").setDescription("ID del reminder da cancellare").setRequired(true)),

    exec: async (interaction) => {
      const id = interaction.options.get("id")?.value as string;
      const reminder = await redis.hget('reminders', id);

      if (!reminder) {
        await interaction.reply('Non ho trovato un reminder con questo id');
        return;
      }

      await redis.hdel('reminders', id);
      await interaction.reply('Il reminder è stato cancellato!');
    }
  });
};
