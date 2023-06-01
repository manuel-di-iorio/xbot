import { AttachmentBuilder, Events, SlashCommandBuilder } from "discord.js";
import moment from 'moment';
import { logger } from "../logger.js";
import { addEvent } from "../lib/discord/events/index.js";
import { MessageModel } from "../db/Message.js";
import { addModule } from "./index.js";
import { addCmd } from "../lib/discord/registerCmds.js";
import { NEWLINE } from "../utils/newline.js";
import { UserModel } from "../db/User.js";

export const MessageStoreModule = () => addModule("MessageStore", () => {
  addEvent(Events.MessageCreate, async (msg) => {
    if (msg.author.bot) return;
    const { id: channelId } = msg.channel;

    const prettyDate = moment(msg.createdAt).format('DD/MM/YYYY HH:mm:ss');
    const safeContent = msg?.content.replace(/(\r\n|\n|\r)/gm, ' ').replace(/`/g, "'");
    let data = `[${prettyDate}] ${msg.member?.displayName || msg.author.username}: ${safeContent}`;

    if (msg.attachments.size) {
      if (safeContent) data += ' ';
      data += `[Allegato] ${msg.attachments?.first()?.url}`;
    }

    try {
      await Promise.all([
        MessageModel.push(channelId, data),
        UserModel.increaseMsgCount(msg.author.id)
      ]);

      await MessageModel.trim(channelId);
    } catch (err) {
      logger.error(err);
    }
  });

  const buildLogAttachment = async (channelId: string, logName: string) => {
    // Get a copy of the store
    const messages = await MessageModel.list(channelId);

    // Create the log
    if (!messages.length) return;

    let log = '';
    for (let i = 0, len = messages.length; i < len; i++) {
      log += `- ${messages[i]}${NEWLINE}`;
    }

    // Send the log
    const logBuffer = Buffer.from(log, 'utf8');
    return {
      attachment: new AttachmentBuilder(logBuffer, { name: logName })
    };
  };

  addCmd({
    data: new SlashCommandBuilder()
      .setName("log")
      .setDescription("Mostra gli ultimi messaggi di questo canale"),

    exec: async (interaction) => {
      if (!interaction.channel) {
        await interaction.reply("Usare questo comando in un canale testuale");
        return;
      }

      await interaction.deferReply();
      const log = await buildLogAttachment(interaction.channel.id, 'log.txt');

      if (!log) {
        interaction.editReply('Non ci sono ancora messaggi registrati in questo canale');
        return;
      }

      await interaction.editReply({ content: '**Ultimi messaggi di questo canale:**', files: [log.attachment] });
    }
  });
});
