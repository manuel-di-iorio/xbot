import { redis } from "../../lib/redis/index.js";

const channelField = "c";
const msgField = "msg";

const getChannelMsgField = (channelId: string) => `${channelField}:${channelId}:${msgField}`;

export const MessageModel = {
  list: async (channelId: string) => {
    return redis.lrange(getChannelMsgField(channelId), 0, -1);
  },

  push: async (channelId: string, data: string) => {
    redis.lpush(getChannelMsgField(channelId), data);
  },

  // Trim the messages to limit memory usage
  trim: async (channelId: string) => {
    await redis.ltrim(getChannelMsgField(channelId), 0, 999);
  }
};
