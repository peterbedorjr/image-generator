const { createLogger, format, transports } = require('winston');
const { Console } = transports;
const { printf, combine, timestamp } = format;

require('winston-daily-rotate-file');

const createDailyRotateTransport = (level = 'combined') => {
  const options = {
    dirname: 'logs',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  };

  if (level === 'combined') {
    return new transports.DailyRotateFile({
      ...options,
      filename: 'combined-%DATE%.log',
    });
  }

  return new transports.DailyRotateFile({
    ...options,
    filename: `${level}-%DATE%.log`,
    level,
  });
}



const formatter = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${(level || 'unknown').toUpperCase()}]: ${message}`;
});

const date = new Date().toISOString().split('T')[0];

const logger = createLogger({
  format: combine(
    timestamp(),
    formatter,
  ),
  transports: [
    createDailyRotateTransport('error'),
    createDailyRotateTransport(),
  ],
  exceptionHandlers: [
    createDailyRotateTransport('exceptions'),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new Console({
    format: combine(
      timestamp(),
      formatter,
    ),
  }));
}

module.exports = logger;
