import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const defaultFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD[T]HH:mm:ss.SSS" }),  // [Z]ZZ
  // winston.format.json(),
  winston.format.printf(({ timestamp, level, message }) => {return `${timestamp}|${level}|${message}`})
)

const defaultTransport = new DailyRotateFile({
  level: "info",
  filename: "info.log.%DATE%",
  dirname: "/data/log/",
  createSymlink: true,
  symlinkName: "info.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
  maxSize: "1024m",
  maxFiles: "7d",  // 7 days
});

const errorTransport = new DailyRotateFile({
  level: "error",
  filename: "error.log.%DATE%",
  dirname: "/data/log/",
  createSymlink: true,
  symlinkName: "error.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
  maxSize: "1024m",
  maxFiles: "7d",  // 7 days
});

// info_logger
export const logger = winston.createLogger({
  level: "info",
  format: defaultFormat,
  // defaultMeta: { service: "user-service" },
  transports: [
    defaultTransport, errorTransport
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      defaultFormat
    )
  }));
}
