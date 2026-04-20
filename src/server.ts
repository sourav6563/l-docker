import { logger } from "./utils/logger";

import { env } from "./env";
import { app } from "./app";
const server = app.listen(env.PORT, () => {
  logger.info(`hey server running on port: ${env.PORT}`);
});

server.on("error", (error) => {
  logger.error(error);
  process.exit(1);
});
