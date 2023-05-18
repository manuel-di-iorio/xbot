import BullQueue, { Queue } from 'bull';
import { getStarterFn } from '../index.js';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_USER } from '../../config.js';
import { SendPrimeReminderTask } from './tasks/sendPrimeReminder.js';
import { QueueTask } from './type.js';
import { logger } from '../../logger.js';
import { SendRemindersTask } from './tasks/sendReminders.js';

export const name = "Scheduler";

const scheduleTask = async (queue: Queue, task: QueueTask) => {
  const { name } = task;

  queue.process(name, async () => {
    try {
      await task.exec();
    } catch (err) {
      logger.error(err);
    }
  });

  const job = await queue.getJob(name);

  if (!job) {
    await queue.add(name, null, {
      removeOnComplete: true,
      attempts: 3,
      repeat: {
        tz: 'Europe/Rome',
        cron: task.cron
      }
    });
  }
};

export const start = getStarterFn(name, async () => {
  const redisUrl = REDIS_HOST
    .replace("{{user}}", REDIS_USER)
    .replace("{{password}}", REDIS_PASSWORD);

  const queue = new BullQueue('scheduler', redisUrl);

  await Promise.all([
    scheduleTask(queue, SendPrimeReminderTask),
    scheduleTask(queue, SendRemindersTask)
  ]);
});
