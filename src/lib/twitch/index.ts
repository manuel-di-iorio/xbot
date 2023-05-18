import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getStarterFn } from "../index.js";
import { TWITCH_API_LOGIN_HOST, TWITCH_API_HOST, TWITCH_CLIENT_ID, TWITCH_SECRET, TWITCH_USER_ID } from '../../config.js';
import { EmbedBuilder } from 'discord.js';
import { broadcastEmbed } from '../../utils/embeds.js';
import { logger } from '../../logger.js';

type StreamInfo = {
  title: string,
  type: string,
  game_name: string,
  thumbnail_url: string
}

export const name = "Twitch";
let headers: AxiosRequestConfig | undefined;
const liveCheckTimeout = 1000 * 60;
const refreshAccessTokenTimeout = 1000 * 60 * 3;
const canCheckLiveTimeout = 1000 * 60 * 60;
let canCheckLive = true;
let latestLiveTitle: string;

/**
 * Get the new access token
 */
const getAccessToken = async () => {
  try {
    const { data: { access_token: accessToken } } = await axios.post(`${TWITCH_API_LOGIN_HOST}/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_SECRET}&grant_type=client_credentials`);

    headers = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': TWITCH_CLIENT_ID
      }
    } as AxiosRequestConfig;
  } catch (err) {
    logger.error(err);
    headers = undefined;
    setTimeout(getAccessToken, refreshAccessTokenTimeout);
  }
};

const getStreamInfo = async () => {
  try {
    const response: AxiosResponse<{ data: [StreamInfo] }> = await axios(`${TWITCH_API_HOST}/streams?user_id=${TWITCH_USER_ID}`, headers);
    const { data: { data: streams } } = response;
    return streams?.[0];
  } catch (err) {
    const error = err as AxiosError;
    // Refresh the token when expired
    if (error.response?.status === 401) {
      await getAccessToken();
      logger.debug(`[${name}] Refreshing access token..`);
    } else {
      logger.error(error);
    }
  }
};

/**
 * Check if the channel is live
 */
const checkIsLive = async () => {
  if (headers && canCheckLive) {
    const stream = await getStreamInfo();

    if (stream && stream.type === 'live' && stream.title !== latestLiveTitle) {
      // Temporarily disable the live check
      latestLiveTitle = stream.title;
      canCheckLive = false;
      setTimeout(() => { canCheckLive = true; }, canCheckLiveTimeout);

      try {
        // Get the channel icon
        const { data: { data: usersData } } = await axios(`${TWITCH_API_HOST}/users?id=${TWITCH_USER_ID}`, headers);
        const [userData] = usersData;
        const channelIcon = userData.profile_image_url;

        // Send the bot notification of the live stream
        const embed = new EmbedBuilder();
        embed.setColor('#6441a5'); // Purple
        embed.setTitle(`LIVE ORA: ${stream.title.toUpperCase()}`);
        embed.setDescription('Partecipa su https://www.twitch.tv/gamemakeritalia');
        embed.setURL('https://www.twitch.tv/gamemakeritalia');
        embed.setFooter({ text: `GMI sta streammando ${stream.game_name}`, iconURL: channelIcon });
        embed.setImage(stream.thumbnail_url
          .replace('{width}', '320')
          .replace('{height}', '200')
        );

        await broadcastEmbed(embed);
      } catch (err) {
        logger.error(err);
      }
    }
  }

  setTimeout(checkIsLive, liveCheckTimeout);
};

export const start = getStarterFn(name, async () => {
  await getAccessToken();
  await checkIsLive();
});

