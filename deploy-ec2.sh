#!/bin/bash

echo "🚀 Setting up WhatsApp Bot on EC2..."

# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# Install Chrome dependencies
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

# Install Chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
sudo yum install -y ./google-chrome-stable_current_x86_64.rpm

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /opt/whatsapp-bot
sudo chown ec2-user:ec2-user /opt/whatsapp-bot

# Clone project (you'll need to replace with your repo)
cd /opt/whatsapp-bot
git clone https://github.com/your-username/whats-app-bot.git .

# Install dependencies
npm install

# Create logs directory
mkdir -p logs

# Set up PM2 ecosystem
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'whatsapp-bot',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

echo "✅ Setup complete! Next steps:"
echo "1. Upload your credentials.json file"
echo "2. Update config.js with your settings"
echo "3. Start the bot with: pm2 start ecosystem.config.js"