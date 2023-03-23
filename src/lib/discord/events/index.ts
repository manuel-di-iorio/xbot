import { ClientEvents } from "discord.js";

export const events: {
  [key: string]: Array<(...args: any) => Promise<void>>
} = {};

export const addEvent = <K extends keyof ClientEvents>(event: K, cb: (...args: ClientEvents[K]) => Promise<void>) => {
  if (!events[event]) {
    events[event] = [];
  }

  events[event].push(cb);
};
