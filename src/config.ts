import * as dotenv from 'dotenv';

dotenv.config();

const { env } = process;

export const LOG_LEVEL = env.LOG_LEVEL as string;
export const CHATGPT_APIKEY = env.CHATGPT_APIKEY as string;
export const DISCORD_CLIENTID = env.DISCORD_CLIENTID as string;
export const DISCORD_TOKEN = env.DISCORD_TOKEN as string;
export const GMI_GUILD_ID = env.GMI_GUILD_ID as string;
export const REDIS_HOST = env.REDIS_HOST as string;
export const REDIS_USER = env.REDIS_USER as string;
export const REDIS_PASSWORD = env.REDIS_PASSWORD as string;
export const GENERAL_CHANNEL = env.GENERAL_CHANNEL as string;
export const NOTIFICATIONS_CHANNEL = env.NOTIFICATIONS_CHANNEL as string;
export const GMI_MEMBER_ROLE = env.GMI_MEMBER_ROLE as string;
export const GOOGLE_SERVICEACCOUNT = env.GOOGLE_SERVICEACCOUNT && JSON.parse(Buffer.from(env.GOOGLE_SERVICEACCOUNT as string, "base64").toString("utf-8"));
export const WITAI_APIKEY = env.WITAI_APIKEY as string;
export const OPEN_WEATHER_MAP_APIKEY = env.OPEN_WEATHER_MAP_APIKEY as string;
export const TWITCH_CLIENT_ID = env.TWITCH_CLIENT_ID as string;
export const TWITCH_SECRET = env.TWITCH_SECRET as string;
export const TWITCH_USER_ID = env.TWITCH_USER_ID as string;

export const TWITCH_API_LOGIN_HOST = 'https://id.twitch.tv';
export const TWITCH_API_HOST = 'https://api.twitch.tv/helix';
export const BOT_COLOR = '#9c59b6';
