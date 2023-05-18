import { DiscordErrorData, Snowflake, TextChannel } from "discord.js";
import { logger } from "../../../logger.js";
import { redis } from "../../redis/index.js";
import { QueueTask } from "../type.js";
import { client } from "../../discord/index.js";
import { NEWLINE } from "../../../utils/newline.js";

export type Reminder = {
  msg: string;
  exp: string;
  usr: string;
  chn: string;
}

const hasKey = Object.prototype.hasOwnProperty.call.bind(Object);

const getActiveReminders = async () => {
  // Get all the active reminders
  let reminders: Record<string, string>;
  try {
    reminders = await redis.hgetall('reminders');
    if (!reminders || !Object.keys(reminders).length) return;
    return reminders;
  } catch (err) {
    logger.error(err);
  }
};

export const SendRemindersTask: QueueTask = {
  name: 'reminders',
  cron: '* * * * *', // Every minute
  exec: async () => {
    const reminders = await getActiveReminders();
    if (!reminders) return;

    const now = Date.now();
    for (const id in reminders) {
      if (!hasKey(reminders, id)) continue;

      // Parse the reminder content
      const reminder: Reminder = JSON.parse(reminders[id]);

      // Expiration check
      if (now < new Date(reminder.exp).getTime()) continue;

      try {
        // Get the updated user and channel
        const [user, channel] = await Promise.all([
          client.users.fetch(reminder.usr as Snowflake),
          client.channels.fetch(reminder.chn as Snowflake) as unknown as TextChannel
        ]);

        // Ensure to delete the reminder before sending it to the user (to avoid duplicates)
        await redis.hdel('reminders', id);

        // Check if the channel still exists
        if (!channel) {
          logger.debug(`[Scheduler] Channel ${channel} not found for the reminder #${id}`);
          continue;
        }

        // Send the reminder message to the user
        await channel.send(`⚠️ **REMINDER DI ${user}** ⚠️${NEWLINE + reminder.msg}`);
      } catch (err) {
        const error = err as DiscordErrorData;
        if (error.code === 50001) { // DiscordMissingAccessError
          redis.hdel('reminders', id).catch((err: Error) => logger.error(err));
        } else {
          logger.error('[REMINDERS SCHEDULER] Error:');
          logger.error(err);
        }
      }
    }
  }
};
