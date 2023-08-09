import "winston-daily-rotate-file";
import DailyRotateFile from "winston-daily-rotate-file";
import { createLogger, Logger, format, transports, config } from "winston";
import { S3StreamLogger } from "s3-streamlogger";
const { combine, timestamp, label, printf } = format;

//DailyRotateFile func()
const fileRotateTransport = new transports.DailyRotateFile({
  filename: "logs/app-rotate-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "7d",
  maxSize: "10gb",
});

let _LOGGER_CACHE: { [name: string]: Logger } = {};

export function getIndexerLogger(loggerName: string): Logger {
  if (loggerName in _LOGGER_CACHE) {
    return _LOGGER_CACHE[loggerName];
  }

  let transportOptions: (
    | transports.HttpTransportInstance
    | transports.ConsoleTransportInstance
    | transports.StreamTransportInstance
    | DailyRotateFile
  )[] = [];
  // Datadog logging
  // if (process.env.DIGITAL_OCEAN_LOGGING_ENABLE) {
  //   const s3Stream = new S3StreamLogger({
  //     bucket: process.env.DIGITAL_OCEAN_LOGGING_BUCKET,
  //     config: {
  //       endpoint: process.env.DIGITAL_OCEAN_SPACE_ENDPOINT,
  //     },
  //     // region: "ap-south-1",
  //     access_key_id: process.env.DIGITAL_OCEAN_ACCESS_KEY_ID,
  //     secret_access_key: process.env.DIGITAL_OCEAN_SECRET_ACCESS_KEY,
  //     tags: { type: "OMG" },
  //   });

  //   transportOptions.push(
  //     new transports.Stream({
  //       stream: s3Stream,
  //     }),
  //   );

  //   // const httpTransportOptions = {
  //   //   host: "http-intake.logs.datadoghq.com",
  //   //   path: `/api/v2/logs?dd-api-key=${process.env.DD_API_KEY}&ddsource=nodejs&service=${process.env.DD_APP_NAME}`,
  //   //   ssl: false,
  //   // };
  //   // console.log(httpTransportOptions.path);
  // }

  transportOptions.push(fileRotateTransport);
  transportOptions.push(new transports.Console());

  const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${level}] ${label}: ${message}`;
  });

  const logger = createLogger({
    levels: config.syslog.levels,
    format: combine(label({ label: loggerName }), timestamp(), myFormat),
    transports: transportOptions,
    // transports: [
    //   //
    //   // - Write all logs with importance level of `error` or less to `error.log`
    //   // - Write all logs with importance level of `info` or less to `combined.log`
    //   //
    //   new transports.Console(),
    //   new transports.File({
    //     filename: "src/logs/transaction.log",
    //     level: "debug",
    //   }),
    // ],
  });

  return (_LOGGER_CACHE[loggerName] = logger);
}
