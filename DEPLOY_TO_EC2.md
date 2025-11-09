# Deploy to EC2 - Quick Commands

## 1. SSH into your EC2 instance
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

## 2. Navigate to bot directory and pull changes
```bash
cd /opt/whatsapp-bot
git pull origin main
```

## 3. Restart the bot
```bash
pm2 restart whatsapp-bot
```

## 4. Check status and logs
```bash
pm2 status
pm2 logs whatsapp-bot --lines 20
```

## 5. Test the @all fix
- Go to your WhatsApp group (120363421150088277@g.us)
- As an authorized admin, type `@all`
- Bot should reply with just `@all` and tag everyone properly

## Changes Made:
✅ Fixed @all tagging mechanism
✅ Removed Docker files (not needed)
✅ Bot now uses WhatsApp's native group tagging

## If you need to check bot status:
```bash
curl http://localhost:3001/health
```