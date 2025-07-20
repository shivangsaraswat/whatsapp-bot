const { google } = require('googleapis');
const fs = require('fs');
const config = require('../config');
const winston = require('winston');

// Logger setup
const logFilePath = config.logFile || 'logs/app.log';
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: logFilePath }),
    new winston.transports.Console()
  ]
});

let sheetsClient = null;

async function authorize() {
  try {
    const credentials = JSON.parse(fs.readFileSync(config.google.credentialsPath));
    const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes
    });
    sheetsClient = google.sheets({ version: 'v4', auth });
    logger.info('Google Sheets API authorized.');
    return sheetsClient;
  } catch (err) {
    logger.error('Failed to authorize Google Sheets API:', err);
    throw err;
  }
}

async function findNumberInSheets(number, sheetIds, maxRetries = 2) {
  if (!sheetsClient) await authorize();
  number = number.replace(/\D/g, ''); // Normalize number (digits only)
  logger.info(`[DEBUG] Searching for number: ${number}`);
  let sheetLoadFailed = false;
  for (const sheetId of sheetIds) {
    let attempt = 0;
    let sheetLoaded = false;
    while (attempt <= maxRetries) {
      try {
        const res = await sheetsClient.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'A:Z' // Fetch more columns to get region
        });
        sheetLoaded = true;
        const rows = res.data.values || [];
        for (const row of rows) {
          if (row[0]) {
            const sheetNumber = row[0].replace(/\D/g, '');
            // logger.info(`[DEBUG] Comparing sheet number: ${sheetNumber} with searched number: ${number}`); // Suppress noisy log
            if (sheetNumber === number || sheetNumber.slice(-10) === number.slice(-10)) {
              const name = row[3] || "Unknown"; // Column D (index 3)
              const gender = row[5] || "Unknown"; // Column F (index 5)
              const email = row[2] || "Unknown"; // Column C (index 2)
              const region = row[6] || "Unknown"; // Column G (index 6)
              logger.info(`[DEBUG] Match found: ${sheetNumber}`);
              logger.info(`Number ${number} found in sheet ${sheetId} with name: ${name}, gender: ${gender}, email: ${email}, region: ${region}`);
              return { found: true, name, gender, email, region };
            }
          }
        }
        break; // Success, break retry loop
      } catch (err) {
        logger.warn(`Error reading sheet ${sheetId} (attempt ${attempt + 1}): ${err.message}`);
        if (attempt === maxRetries) {
          logger.error(`Failed to read sheet ${sheetId} after ${maxRetries + 1} attempts.`);
          sheetLoadFailed = true;
        }
        attempt++;
      }
    }
    if (sheetLoaded) sheetLoadFailed = false;
  }
  if (sheetLoadFailed) {
    logger.info(`[DEBUG] Sheet load failed for all sheets.`);
    return { error: 'sheet_load_failed' };
  }
  logger.info(`[DEBUG] Number ${number} not found in any sheet.`);
  logger.info(`Number ${number} not found in any sheet.`);
  return { found: false, region: null };
}

module.exports = {
  authorize,
  findNumberInSheets
}; 