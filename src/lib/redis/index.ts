import { Redis } from "ioredis";
import { REDIS_HOST, REDIS_USER, REDIS_PASSWORD } from "../../config.js";
import { logger } from "../../logger.js";
import { getStarterFn } from "../index.js";

export const name = "Redis";

const host = REDIS_HOST
  .replace("{{user}}", REDIS_USER)
  .replace("{{password}}", REDIS_PASSWORD);

export const redis = new Redis(host, {
  lazyConnect: true
});

redis.on('error', (err: Error) => logger.error(err));

export const start = getStarterFn(name, async () => {
  await redis.connect();
});

/**
 * Recursively and progressively scan the redis keys
 */
export const scanKeys = async (
  pattern: string, cursor = '0', set: Set<string> = new Set(), stopOnNext = false
): Promise<Set<string>> => {
  const [currentCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);

  for (let i = 0; i < keys.length; i++) {
    set.add(keys[i]);
  }

  if (!stopOnNext) {
    return await scanKeys(pattern, currentCursor, set, currentCursor === '0');
  }

  return set;
};
