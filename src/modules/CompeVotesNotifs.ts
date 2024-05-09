import { EmbedBuilder, TextChannel } from "discord.js";
import axios, { AxiosResponse } from "axios";
import { addModule } from "./index.js";
import { logger } from "../logger.js";
import { redis } from "../lib/redis/index.js";
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
const compeChId = "1191780970089689108";

const notifyUpdate = async (global: number, judge: string, judgeStats: number, game: string, gameStats: number) => {
  // Notify the embed
  const embed = new EmbedBuilder()
    .setColor(BOT_COLOR)
    .setTitle("AGGIORNAMENTO COMPETIZIONE")
    .setDescription(`**${judge}** ha votato **${game}**${DOUBLE_NEWLINE}Progresso voti del giudice: **${judgeStats}%**${NEWLINE}Progresso voti del gioco: **${gameStats}%**`)
    .setFooter({ text: `Globale: ${global}%` });

  const gmiGuildIcon = client.guilds.cache.get(GMI_GUILD_ID)?.iconURL({ extension: 'png', size: 256 });
  if (gmiGuildIcon) {
    embed.setThumbnail(gmiGuildIcon);
  }

  try {
    const compeCh = client.channels.cache.get(compeChId) as TextChannel;
    await compeCh.send({ embeds: [embed], });
  } catch (err) {
    logger.error(err);
  }
};

const checkVotes = async () => {
  try {
    const response: AxiosResponse<{ stats: Stats }> = await axios("https://gmitalia.altervista.org/api/stats.php?ctx=26");
    const { data: { stats } } = response;
    const actualGlobal = stats.global;
    if (actualGlobal === redisVotes.global) return;

    if (actualGlobal === 100) {
      redisVotes = stats;
      await redis.set(redisKey, JSON.stringify(stats));

      const embed = new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setTitle("AGGIORNAMENTO COMPETIZIONE")
        .setDescription(`Le votazioni sono concluse, complimenti a tutti per la partecipazione! Ci vediamo presto in live su${NEWLINE}**https://www.twitch.tv/gamemakeritalia**`);

      const gmiGuildIcon = client.guilds.cache.get(GMI_GUILD_ID)?.iconURL({ extension: 'png', size: 256 });
      if (gmiGuildIcon) {
        embed.setThumbnail(gmiGuildIcon);
      }
      const compeCh = client.channels.cache.get(compeChId) as TextChannel;
      await compeCh.send({ embeds: [embed], });
      return;
    }

    // Find the updated judge vote percentage
    if (redisVotes.byJudge && Object.values(redisVotes.byJudge).length) {
      for (const [judge, newVoteStats] of Object.entries(stats.byJudge)) {
        const oldVoteStats = redisVotes.byJudge[judge];
        if (newVoteStats <= oldVoteStats) continue;

        // Find the updated game
        for (const [game, newGameStats] of Object.entries(stats.byGame)) {
          const oldGameStats = redisVotes.byGame[game];
          if (newGameStats <= oldGameStats) continue;

          await notifyUpdate(actualGlobal, judge, newVoteStats, game, newGameStats);
          break;
        }

        break;
      }
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
