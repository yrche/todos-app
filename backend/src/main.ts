import cors from "cors";
import express from "express";
import { pinoHttp } from "pino-http";
import { logger } from "@config/config.logger.js";
import { BaseLogger } from "@infrastructure/logger/base.logger.js";
import env from "@config/config.env.js";
import { errorMiddleware } from "@gateways/middlewares/error.middleware.js";
import todosRouter from "@gateways/routers/todos.router.js";
import categoriesRouter from "@gateways/routers/categories.router.js";
import { initializeDatabase } from "@infrastructure/database/database.bootstrap.js";

const app = express();

async function main() {
  try {
    const serverLogger = new BaseLogger(logger);
    const port = env.PORT ? Number(env.PORT) : 3001;

    app.use(pinoHttp({ logger }));
    app.use(
      cors({
        origin: env.CLIENT_ORIGIN ?? "*",
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
      }),
    );
    app.use(express.json());

    await initializeDatabase();

    app.use("/todos", todosRouter);
    app.use("/categories", categoriesRouter);

    app.use(errorMiddleware);

    app.listen(port, () => {
      serverLogger.info(`Server listen on port: ${port}`);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
}

main();
