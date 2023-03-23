import { ChatGPTAPI } from 'chatgpt';
import { CHATGPT_APIKEY } from '../../config.js';
import { getStarterFn } from '../index.js';

let client: ChatGPTAPI;

export const start = getStarterFn("ChatGPT", async () => {
  client = new ChatGPTAPI({
    apiKey: CHATGPT_APIKEY
  });
});

export const sendMessage = async (msg: string) => (await client.sendMessage(msg)).text;
