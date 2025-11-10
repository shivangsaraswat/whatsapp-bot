# WhatsApp Group Join Verifier Bot

This Node.js app automates WhatsApp group join requests by verifying phone numbers against Google Sheets. It uses a single admin WhatsApp number to manage multiple groups and sheets.

## Features
- WhatsApp Web automation (via `whatsapp-web.js`)
- Google Sheets API integration
- Phone number verification
- @all tagging with rate limiting (3 uses per 24h)
- Media blocking in verification groups
- Docker support for easy deployment

## Quick Start with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Google Service Account credentials

### 1. Clone Repository
```bash
git clone https://github.com/shivangsaraswat/whatsapp-bot.git
cd whatsapp-bot
```

### 2. Setup Credentials
- Place your `credentials.json` (Google Service Account) in the project root
- Edit `config.js` with your group IDs and settings

### 3. Run with Docker
```bash
# Start the bot
docker-compose up -d

# View logs and scan QR code
docker-compose logs -f whatsapp-bot
```

### 4. Scan QR Code
- QR code will appear in logs
- Scan with your admin WhatsApp account
- Bot will start automatically

### Docker Commands
```bash
# Stop bot
docker-compose down

# Restart bot
docker-compose restart

# View logs
docker-compose logs -f whatsapp-bot

# Update and rebuild
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Manual Setup (Without Docker)

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
- Add your WhatsApp group JIDs, invite links, and Google Sheet IDs
- Set your admin WhatsApp number
- Configure allowed admins for @all feature

### 4. Run the Bot
```bash
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

## Deployment

### Docker (Recommended)
Best for production deployment:
- Persistent WhatsApp session
- Auto-restart on failure
- Easy updates
- Isolated environment

### Manual
Best for development:
- Direct access to code
- Easier debugging
- No Docker required

## Sharing with Others

### Option 1: Share Docker Image
```bash
# Build image
docker build -t whatsapp-bot .

# Save image
docker save whatsapp-bot > whatsapp-bot.tar

# Share the .tar file
# Others can load it with:
docker load < whatsapp-bot.tar
```

### Option 2: Share GitHub Repository
```bash
# Others clone and run:
git clone https://github.com/shivangsaraswat/whatsapp-bot.git
cd whatsapp-bot
# Add credentials.json and config.js
docker-compose up -d
```

### Option 3: Docker Hub (Public)
```bash
# Tag and push to Docker Hub
docker tag whatsapp-bot yourusername/whatsapp-bot:latest
docker push yourusername/whatsapp-bot:latest

# Others can pull and run:
docker pull yourusername/whatsapp-bot:latest
docker run -d -v $(pwd)/credentials.json:/app/credentials.json yourusername/whatsapp-bot:latest
```

## Troubleshooting

### QR Code Not Showing
```bash
docker-compose logs -f whatsapp-bot
```

### Clear Session and Re-authenticate
```bash
docker-compose down -v
docker-compose up -d
```

### Bot Not Responding
- Check if container is running: `docker-compose ps`
- Check logs: `docker-compose logs whatsapp-bot`
- Verify credentials.json exists
- Verify config.js is correct

## Notes
- Phone numbers are matched as digits only (ignore formatting)
- WhatsApp session persists in Docker volumes
- Logs are saved in `./logs` directory
- You can add more groups and sheets in `config.js`

## License
MIT 