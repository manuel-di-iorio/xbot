import mongoose from "mongoose";
import { MONGODB_HOST, MONGODB_PASSWORD, MONGODB_USER } from "../../config.js";
import { logger } from "../../logger.js";
import { getStarterFn } from "../index.js";

export const name = "MongoDB";

const host = MONGODB_HOST
  .replace("{{user}}", MONGODB_USER)
  .replace("{{password}}", MONGODB_PASSWORD);

export const start = getStarterFn(name, async () => {
  await mongoose.connect(host);
});

// Cleanup on exit
['SIGHUP', 'SIGINT', 'SIGTERM'].forEach(function (sig) {
  process.on(sig, async () => {
    try {
      await mongoose.connection.close(true);
      logger.debug(`[${name}] Closed database connection on app exit`);
    } catch (err) {
      logger.error(err, `[${name}] Error while closing database connection on app exit`);
    }

    process.exit(1);
  });
});
