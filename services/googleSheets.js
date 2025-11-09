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

async function findNumberInSheets(number, sheetConfigs, maxRetries = 2) {
  if (!sheetsClient) await authorize();
  number = number.replace(/\D/g, ''); // Normalize number (digits only)
  logger.info(`[DEBUG] Searching for number: ${number}`);
  let sheetLoadFailed = false;
  
  for (const sheetConfig of sheetConfigs) {
    // Handle both old format (string) and new format (object)
    const sheetId = typeof sheetConfig === 'string' ? sheetConfig : sheetConfig.sheetId;
    const subSheetName = typeof sheetConfig === 'object' ? sheetConfig.subSheetName : 'Sheet1';
    
    let attempt = 0;
    let sheetLoaded = false;
    while (attempt <= maxRetries) {
      try {
        const range = subSheetName ? `${subSheetName}!A:Z` : 'A:Z';
        logger.info(`[DEBUG] Reading from sheet ${sheetId}, sub-sheet: ${subSheetName}`);
        
        const res = await sheetsClient.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: range
        });
        
        sheetLoaded = true;
        const rows = res.data.values || [];
        
        for (const row of rows) {
          if (row[3]) { // Check if Phone column (D) has data
            const sheetNumber = row[3] ? row[3].replace(/\D/g, '') : ''; // Column D - Phone
            if (sheetNumber === number || sheetNumber.slice(-10) === number.slice(-10)) {
              const name = row[1] || "Unknown"; // Column B - Name
              const email = row[2] || "Unknown"; // Column C - Email
              const gender = row[4] || "Unknown"; // Column E - Gender
              const region = row[6] || "Unknown"; // Column G - Region
              logger.info(`[DEBUG] Match found: ${sheetNumber} in sub-sheet: ${subSheetName}`);
              logger.info(`Number ${number} found in sheet ${sheetId}/${subSheetName} with name: ${name}, gender: ${gender}, email: ${email}, region: ${region}`);
              return { found: true, name, gender, email, region };
            }
          }
        }
        break; // Success, break retry loop
      } catch (err) {
        logger.warn(`Error reading sheet ${sheetId}/${subSheetName} (attempt ${attempt + 1}): ${err.message}`);
        if (attempt === maxRetries) {
          logger.error(`Failed to read sheet ${sheetId}/${subSheetName} after ${maxRetries + 1} attempts.`);
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