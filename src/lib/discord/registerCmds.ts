import { ChatInputCommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction, REST, Routes, SlashCommandBuilder } from "discord.js";
import { DISCORD_CLIENTID, DISCORD_TOKEN } from "../../config.js";
import { getStarterFn } from "../index.js";
import { logger } from "../../logger.js";

export const name = `Discord.RegisterCmds`;

export type Command = {
  data: ContextMenuCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">,
  exec: (interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction) => Promise<void>
};

export const registeredCommands: {
  [key: string]: Command
} = {};

export const addCmd = (cmd: Command) => {
  registeredCommands[cmd.data.name] = cmd;
};

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

export const start = getStarterFn(name, async () => {
  try {
  // Register the commands against the Discord API
    await rest.put(Routes.applicationCommands(DISCORD_CLIENTID), {
      body: Object.values(registeredCommands).map(cmd => cmd.data)
    });
  } catch (error) {
    logger.error(error);
  }
});
