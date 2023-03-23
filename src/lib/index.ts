import { logger } from "../logger.js";

/**
 * Return a starter function, that executes the cb and log the execution time
 */
export const getStarterFn = (name: string, cb: () => Promise<unknown>) => async () => {
  logger.trace(`[${name}] Starting..`);
  const start = performance.now();
  await cb();
  const stop = performance.now();
  logger.info(`[${name}] Ready in ${Number((stop - start) / 1000).toFixed(3)}ms`);
};
