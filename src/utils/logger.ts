import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, json, colorize, printf } = format;

// Console format (colored & simple)
const consoleFormat = combine(
  colorize(),
  printf(({ level, message }) => `${level}:${message}`),
);

// Create logger
const logger = createLogger({
  level: "info",
  format: combine(timestamp(), json()),
  transports: [
    new transports.Console({ format: consoleFormat }),
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "3d",
      auditFile: "logs/.audit.json",
    }),
  ],
});

export { logger };
