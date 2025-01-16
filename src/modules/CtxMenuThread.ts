// Context menu commands for thread owners
import { ApplicationCommandType, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, PublicThreadChannel } from "discord.js";
import { addCmd } from "../lib/discord/registerCmds.js";
import { addModule } from "./index.js";


export const CtxMenuThreadModule = () => addModule("CtxMenuThread", () => {
  addCmd({
    data: new ContextMenuCommandBuilder()
      .setName('Elimina messaggio')
       // @ts-expect-error Will be fixed in a newer version
      .setType(ApplicationCommandType.Message),

    exec: async (interaction) => {
      const msg = interaction as MessageContextMenuCommandInteraction;
      const { channel } = msg;
      const thread = channel as PublicThreadChannel;

      if (!channel || !channel.isThread() || thread.ownerId !== msg.user.id) {
        await msg.reply({ content: "Usa quest'azione in un thread che hai creato", ephemeral: true });
        return;
      }

      const { targetMessage } = msg;
      if (!targetMessage.deletable) {
        await msg.reply({ content: "Il messaggio non è cancellabile", ephemeral: true });
        return;
      }

      await targetMessage.delete();
      await msg.reply({ content: "Il messaggio è stato cancellato", ephemeral: true });
    }
  });

  addCmd({
    data: new ContextMenuCommandBuilder()
      .setName('Pinna o unpinna')
      // @ts-expect-error Will be fixed in a newer version
      .setType(ApplicationCommandType.Message),

    exec: async (interaction) => {
      const msg = interaction as MessageContextMenuCommandInteraction;
      const { channel } = msg;
      const thread = channel as PublicThreadChannel;

      if (!channel || !channel.isThread() || thread.ownerId !== msg.user.id) {
        await msg.reply({ content: "Usa quest'azione in un thread che hai creato", ephemeral: true });
        return;
      }

      const { targetMessage } = msg;
      if (!targetMessage.pinnable) {
        await msg.reply({ content: "Il messaggio non è pinnabile", ephemeral: true });
        return;
      }

      if (!targetMessage.pinned) {
        await targetMessage.pin();
        await msg.reply({ content: "Il messaggio è stato pinnato", ephemeral: true });
      } else {
        await targetMessage.unpin();
        await msg.reply({ content: "Il messaggio è stato rimosso dai pinnati", ephemeral: true });
      }
    }
  });
});
