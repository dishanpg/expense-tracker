import { Params } from "nestjs-pino";
import { randomUUID } from "crypto";
import { IncomingMessage } from "http";

export const loggerConfig: Params = {
  pinoHttp: {
    transport:
      process.env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              singleLine: false,
              messageFormat: "[{context}] {msg}",
              ignore: "pid,hostname",
            },
          }
        : undefined,
    level:
      process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === "production" ? "info" : "debug"),
    autoLogging: true,
    genReqId: (req: IncomingMessage) => {
      const requestId = req.headers["x-request-id"];
      return (
        (Array.isArray(requestId) ? requestId[0] : requestId) || randomUUID()
      );
    },
  },
};
