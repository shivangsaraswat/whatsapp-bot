require('dotenv').config();
const { authorize } = require('./services/googleSheets');
const { startBot } = require('./services/whatsappBot');
const winston = require('winston');
const config = require('./config');

// Logger setup
const logFilePath = config.logFile || 'logs/app.log';
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: logFilePath }),
    new winston.transports.Console()
  ]
});

(async () => {
  try {
    await authorize();
    logger.info('Google Sheets authorized. Starting WhatsApp bot...');
    startBot();
  } catch (err) {
    logger.error('Startup error:', err);
    process.exit(1);
  }
})(); 