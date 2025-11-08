#!/bin/bash

# AWS EC2 Deployment Script for WhatsApp Bot
echo "🚀 Starting WhatsApp Bot deployment..."

# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /opt/whatsapp-bot
sudo chown ec2-user:ec2-user /opt/whatsapp-bot
cd /opt/whatsapp-bot

# Clone repository (replace with your repo URL)
git clone https://github.com/shivangsaraswat/whatsapp-bot.git .

# Install dependencies
npm ci --only=production

# Create logs directory
mkdir -p logs

# Install Chrome dependencies for Puppeteer
sudo yum install -y \
    alsa-lib \
    atk \
    cups-libs \
    gtk3 \
    libXcomposite \
    libXcursor \
    libXdamage \
    libXext \
    libXi \
    libXrandr \
    libXScrnSaver \
    libXtst \
    pango \
    xorg-x11-fonts-100dpi \
    xorg-x11-fonts-75dpi \
    xorg-x11-fonts-cyrillic \
    xorg-x11-fonts-misc \
    xorg-x11-fonts-Type1 \
    xorg-x11-utils

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Deployment complete! Bot is running with PM2"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs whatsapp-bot"