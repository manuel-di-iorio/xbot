import { EmbedBuilder } from "discord.js";
import axios, { AxiosResponse } from "axios";
import { addModule } from "./index.js";
import { logger } from "../logger.js";
import { redis } from "../lib/redis/index.js";
import { broadcastEmbed } from "../utils/embeds.js";
import { BOT_COLOR, GMI_GUILD_ID } from "../config.js";
import { client } from "../lib/discord/index.js";
import { DOUBLE_NEWLINE, NEWLINE } from "../utils/newline.js";

type Stats = {
  global: number,
  byJudge: { [key: string]: number },
  byGame: { [key: string]: number }
};

let redisVotes: Stats = { global: 0, byJudge: {}, byGame: {} };

const redisKey = "compe-votes-stats";

const notifyUpdate = async (global: number, judge: string, judgeStats: number, game: string, gameStats: number) => {
  // Notify the embed
  const embed = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle("AGGIORNAMENTO COMPETIZIONE")
    .setDescription(`**${judge}** ha votato **${game}**${DOUBLE_NEWLINE}Progresso voto del giudice: **${judgeStats}%**${NEWLINE}Progresso voto del gioco: **${gameStats}%**`)
    .setFooter({ text: `Globale: ${global}%` });

  const gmiGuildIcon = client.guilds.cache.get(GMI_GUILD_ID)?.icon;
  if (gmiGuildIcon) {
    embed.setThumbnail(gmiGuildIcon);
  }

  try {
    await broadcastEmbed(embed);
  } catch (err) {
    logger.error(err);
  }
};

const checkVotes = async () => {
  try {
    const response: AxiosResponse<{ stats: Stats }> = await axios("https://gmitalia.altervista.org/api/stats.php?ctx=20");
    const { data: { stats } } = response;
    const actualGlobal = stats.global;
    if (actualGlobal === redisVotes.global) return;

    // Find the updated judge vote percentage
    for (const [judge, newVoteStats] of Object.entries(stats.byJudge)) {
      const oldVoteStats = redisVotes.byJudge[judge];
      if (newVoteStats <= oldVoteStats) continue;

      // Find the updated game
      for (const [game, newGameStats] of Object.entries(stats.byGame)) {
        const oldGameStats = redisVotes.byGame[game];
        if (newGameStats <= oldGameStats) continue;
        notifyUpdate(actualGlobal, judge, newVoteStats, game, newGameStats);
        break;
      }

      break;
    }

    redisVotes = stats;
    await redis.set(redisKey, JSON.stringify(stats));
  } catch (err) {
    logger.error(err);
  }
};

export const CompeVotesNotifsModule = () => addModule("CompeVotesNotifs", async () => {
  try {
    redisVotes = JSON.parse(await redis.get(redisKey) || '{}');
  } catch (err) {
    logger.error(err);
  }

  checkVotes();
  setInterval(checkVotes, 5000);
});
