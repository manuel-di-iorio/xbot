import { ChatInputCommandInteraction, REST, /*Routes,*/ SlashCommandBuilder } from "discord.js";
import { /*DISCORD_CLIENTID, */DISCORD_TOKEN } from "../../config.js";
import { getStarterFn } from "../index.js";
import { name as discordStarterName } from "./index.js";

export const name = `${discordStarterName}.RegisterCmds`;

export type Command = {
  data: SlashCommandBuilder,
  exec: (interaction: ChatInputCommandInteraction) => Promise<void>
};

export const registeredCommands: {
  [key: string]: Command
} = {};

export const addCmd = (cmd: Command) => {
  registeredCommands[cmd.data.name] = cmd;
};

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

export const start = getStarterFn(name, async () => {
  // Register the commands against the Discord API
  // await rest.put(Routes.applicationCommands(DISCORD_CLIENTID), {
  //   body: Object.values(registeredCommands).map(cmd => cmd.data)
  // });
});
