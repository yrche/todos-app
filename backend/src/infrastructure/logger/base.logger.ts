import { ILogger } from "@infrastructure/logger/interfaces.js";

export class BaseLogger {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  info(message: string) {
    this.logger.info(message);
  }

  error(message: string, error?: unknown) {
    if (error) {
      this.logger.error({ err: error }, message);
      return;
    }

    this.logger.error(message);
  }
}
