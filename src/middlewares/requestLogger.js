// logger/requestLogger.js
const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create winston logger

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, 'requests.log') })
  ]
});

// Custom middleware
const requestLogger = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const logMessage = `${req.method} ${req.originalUrl} from ${ip}`;
  logger.info(logMessage);
  next();
};

module.exports = {
  requestLogger: requestLogger
}