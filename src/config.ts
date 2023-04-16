import * as dotenv from 'dotenv';

dotenv.config();

const { env } = process;

export const LOG_LEVEL = env.LOG_LEVEL as string;
export const CHATGPT_APIKEY = env.CHATGPT_APIKEY as string;
export const DISCORD_CLIENTID = env.DISCORD_CLIENTID as string;
export const DISCORD_TOKEN = env.DISCORD_TOKEN as string;
export const REDIS_HOST = env.REDIS_HOST as string;
export const REDIS_USER = env.REDIS_USER as string;
export const REDIS_PASSWORD = env.REDIS_PASSWORD as string;

export const GENERAL_CHANNEL = env.GENERAL_CHANNEL as string;
export const NOTIFICATIONS_CHANNEL = env.NOTIFICATIONS_CHANNEL as string;
export const GMI_MEMBER_ROLE = env.GMI_MEMBER_ROLE as string;
