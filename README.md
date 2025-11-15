# WhatsApp Group Join Verifier Bot

This Node.js app automates WhatsApp group join requests by verifying phone numbers against Google Sheets. It uses a single admin WhatsApp number to manage multiple groups and sheets.

## Features
- WhatsApp Web automation (via `whatsapp-web.js`)
- Google Sheets API integration
- Phone number verification
- **Auto-approve/reject join requests** (NEW!)
- @all tagging with rate limiting (3 uses per 24h)
- Media blocking in verification groups

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/shivangsaraswat/whatsapp-bot.git
cd whatsapp-bot
npm install
```

### 2. Google Sheets API Credentials
- Create a Google Service Account in Google Cloud Console
- Share your target Google Sheets with the service account email
- Download the credentials JSON and save as `credentials.json` in the project root

### 3. Configure Groups & Sheets
Edit `config.js`:
- Add your WhatsApp group JIDs and Google Sheet IDs
- Add formLink for each group (for rejection messages)
- Set your admin WhatsApp number
- Configure allowed admins for @all feature
- **Important:** Bot must be admin in groups for auto-approve to work

### 4. Run the Bot
```bash
npm start
```
- Scan the QR code with your admin WhatsApp account

## How It Works

### Manual Verification (DM to Bot)
- Users message the admin number with their join request (include group name or invite link)
- The bot extracts their phone number and checks all linked Google Sheets for that group
- If found, the bot replies with the group invite link
- If not, the bot replies with a rejection and a Google Form link

### Auto-Approve Join Requests (NEW!)
- User requests to join a configured WhatsApp group
- Bot automatically detects the join request
- Bot verifies the user's phone number against Google Sheets
- **If verified:** Bot auto-approves and adds user to group + sends welcome DM
- **If not verified:** Bot auto-rejects and sends rejection DM with form link
- All actions are logged automatically

## File Structure
- `index.js` — Main entry
- `config.js` — Group/sheet config
- `services/googleSheets.js` — Google Sheets logic
- `services/whatsappBot.js` — WhatsApp automation
- `logs/app.log` — Log file

## Bot Commands

### Direct Message Commands
- `ping` / `test` / `hello` - Check if bot is online
- `groups` / `list` - Show all WhatsApp groups with IDs
- `help` - Show available commands

### Verification Group Commands
- `verify/PHONENUMBER` - Verify a phone number (e.g., verify/919876543210)
- `botstatus` - Check bot status (admin only)
- `botgroups` - List all groups (admin only)
- `bothelp` - Show help (admin only)

### Admin Commands (in authorized groups)
- `@all` - Tag all group members (rate limited: 3 uses per 24 hours)

## Features Details

### Auto-Approve Join Requests (NEW!)
- Bot listens to all join requests in configured groups
- Automatically verifies phone number against Google Sheets
- **Auto-approves:** Adds user + sends welcome DM with details
- **Auto-rejects:** Removes user + sends rejection DM with form link
- No manual admin intervention needed
- All actions logged to `./logs/app.log`
- **Requirement:** Bot must be group admin

### Phone Number Verification
- Checks phone numbers against Google Sheets
- Returns user details if verified
- Rejects with error message if not found

### @all Tagging
- Only authorized admins can use
- Rate limited to 3 uses per 24 hours per admin
- Replies to admin's message with mentions
- Prevents spam

### Verification Group Protection
- Blocks all messages except verification commands
- Deletes stickers, GIFs, images, videos, and other media
- Warns users to keep group clean
- Only allows `verify/` commands

## Troubleshooting

### QR Code Not Showing
- Restart the bot: `npm start`
- Check terminal output

### Bot Not Responding
- Check if bot is running
- Verify credentials.json exists
- Verify config.js is correct
- Check logs in `./logs/app.log`

## Notes
- Phone numbers are matched as digits only (ignore formatting)
- WhatsApp session persists in `.wwebjs_auth` directory
- Logs are saved in `./logs` directory
- You can add more groups and sheets in `config.js`

## License
MIT 