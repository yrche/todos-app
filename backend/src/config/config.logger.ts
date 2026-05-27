import pino from "pino";
import env, { logFilePath } from "@config/config.env.js";

const environment = env.NODE_ENV === "production";

export const logger = pino(
  {
    level: env.LOG_LEVEL || "info",
  },
  environment
    ? pino.destination({ dest: logFilePath, sync: false })
    : pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }),
);
