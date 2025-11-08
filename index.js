// Load environment variables if .env exists
if (require('fs').existsSync('.env')) {
  require('dotenv').config();
}

const { authorize } = require('./services/googleSheets');
const { startBot } = require('./services/whatsappBot');
const winston = require('winston');
const config = require('./config');
const fs = require('fs');
const path = require('path');

// Start health check server in production
if (process.env.NODE_ENV === 'production') {
  require('./healthcheck');
}

// Ensure logs directory exists
const logsDir = path.dirname(config.logFile || 'logs/app.log');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Logger setup
const logFilePath = config.logFile || 'logs/app.log';
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: logFilePath,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

(async () => {
  try {
    logger.info('Starting WhatsApp Bot application...');
    await authorize();
    logger.info('Google Sheets authorized. Starting WhatsApp bot...');
    startBot();
  } catch (err) {
    logger.error('Startup error:', err);
    process.exit(1);
  }
})(); 