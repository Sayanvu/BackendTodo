const { createLogger, format, transports } = require('winston');
const path = require('path');


const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [
    new transports.File({ filename: path.join('logs', 'combined.log') }),
    new transports.Console() // Optional: logs in terminal
  ]
});

module.exports = logger;