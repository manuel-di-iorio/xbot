import { ChatInputCommandInteraction, Events, Interaction } from "discord.js";
import { registeredCommands } from "../registerCmds.js";
import { addEvent } from "./index.js";

export const interactionCreateEvent = () => {
  addEvent(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand() && !interaction.isMessageContextMenuCommand()) return;

    const cmd = registeredCommands[interaction.commandName];

    if (!cmd) {
      await interaction.reply("Comando non disponibile");
      return;
    }

    await cmd.exec(interaction as ChatInputCommandInteraction);
  });
};
