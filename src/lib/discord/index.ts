import { Client, Events, GatewayIntentBits } from "discord.js";
import { DISCORD_TOKEN } from "../../config.js";
import { logger } from "../../logger.js";
import { modules } from "../../modules/index.js";
import { getStarterFn } from "../index.js";
import { events } from "./events/index.js";
import { interactionCreateEvent } from "./events/interactionCreate.js";
import { start as startDiscordRegisterCmds } from "./registerCmds.js";

export const name = "Discord";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
  ]
});

export const start = getStarterFn(name, async () => {
  const isReady = new Promise(resolve => client.once(Events.ClientReady, () => {
    // Run the modules setup callbacks
    Object.values(modules).forEach(module => module.setup());

    // Register the cmds
    startDiscordRegisterCmds();

    // Setup the client events
    Object.keys(events).forEach((event) => {
      client.on(event, async (...args) => {
        events[event].forEach(async (cb) => {
          try {
            await cb(...args);
          } catch (err) {
            logger.debug(err, `Error in event '${event}':`);
          }
        });
      });
    });

    resolve(null);
  }));

  await client.login(DISCORD_TOKEN);
  await isReady;
});

interactionCreateEvent();
