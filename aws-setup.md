# AWS EC2 Setup Guide for WhatsApp Bot

## 🚀 Quick Deployment Steps

### 1. Launch EC2 Instance
- **Instance Type**: `t2.micro` (Free Tier)
- **AMI**: Amazon Linux 2
- **Storage**: 8GB (Free Tier)
- **Security Group**: 
  - SSH (22) - Your IP
  - Custom TCP (3001) - Your IP (for health checks)

### 2. Connect to Instance
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

### 3. Run Deployment Script
```bash
# Upload and run the deployment script
curl -O https://raw.githubusercontent.com/shivangsaraswat/whatsapp-bot/main/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

### 4. Upload Credentials
```bash
# Upload your credentials.json file
scp -i your-key.pem credentials.json ec2-user@your-instance-ip:/opt/whatsapp-bot/
```

### 5. Start the Bot
```bash
cd /opt/whatsapp-bot
npm run pm2:start
```

## 📊 Monitoring Commands

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs whatsapp-bot

# Restart bot
pm2 restart whatsapp-bot

# Health check
curl http://localhost:3001/health
```

## 🔧 Configuration

### Environment Variables (Optional)
Create `/opt/whatsapp-bot/.env`:
```
NODE_ENV=production
HEALTH_PORT=3001
```

### Auto-restart on Reboot
```bash
pm2 startup
pm2 save
```

## 💰 AWS Free Tier Usage
- **EC2 t2.micro**: 750 hours/month
- **EBS Storage**: 30GB/month
- **Data Transfer**: 15GB/month

## 🔍 Troubleshooting

### Check Chrome Dependencies
```bash
google-chrome --version
```

### Memory Usage
```bash
free -h
htop
```

### Logs Location
- Application: `/opt/whatsapp-bot/logs/`
- PM2: `~/.pm2/logs/`

## 🛡️ Security Best Practices
1. Keep credentials.json secure (never commit to git)
2. Use IAM roles instead of access keys when possible
3. Regularly update system packages
4. Monitor CloudWatch metrics
5. Set up CloudWatch alarms for high CPU/memory usage

## 📈 Scaling Options
- **Vertical**: Upgrade to t3.small if needed
- **Horizontal**: Use Application Load Balancer + Auto Scaling
- **Database**: Move to RDS for session storage
- **Storage**: Use EFS for shared session data