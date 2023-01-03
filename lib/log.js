const { createLogger, format, transports } = require('winston');
const { Console } = transports;
const { printf, combine, timestamp } = format;

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
    new transports.File({ filename: `logs/error-${date}.log`, level: 'error' }),
    new transports.File({ filename: `logs/combined-${date}.log` }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: `logs/exceptions-${date}.log` })
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
