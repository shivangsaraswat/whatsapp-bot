# WhatsApp Group Join Verifier Bot

This Node.js app automates WhatsApp group join requests by verifying phone numbers against Google Sheets. It uses a single admin WhatsApp number to manage multiple groups and sheets.

## Features
- WhatsApp Web automation (via `whatsapp-web.js`)
- Google Sheets API integration
- Modular, config-driven group and sheet management
- Logging and retry logic

## Setup

### 1. Clone & Install
```
git clone <repo-url>
cd tk
npm install
```

### 2. Google Sheets API Credentials
- Create a Google Service Account in Google Cloud Console
- Share your target Google Sheets with the service account email
- Download the credentials JSON and save as `credentials.json` in the project root

### 3. Configure Groups & Sheets
Edit `config.js`:
- Add your WhatsApp group JIDs, invite links, and Google Sheet IDs
- Set your admin WhatsApp number

### 4. Run the Bot
```
npm start
```
- Scan the QR code with your admin WhatsApp account

## How It Works
- Users message the admin number with their join request (include group name or invite link)
- The bot extracts their phone number and checks all linked Google Sheets for that group
- If found, the bot replies with the group invite link
- If not, the bot replies with a rejection and a Google Form link

## File Structure
- `index.js` — Main entry
- `config.js` — Group/sheet config
- `services/googleSheets.js` — Google Sheets logic
- `services/whatsappBot.js` — WhatsApp automation
- `logs/app.log` — Log file

## Notes
- Phone numbers are matched as digits only (ignore formatting)
- You can add more groups and sheets in `config.js`
- For advanced features (Express dashboard, webhooks), extend as needed

## License
MIT 