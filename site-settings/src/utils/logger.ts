import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const logger = pino(
  isDev
    ? {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
      level: "debug",
    }
    : {
      level: "info", // for production
    }
);

export default logger;
