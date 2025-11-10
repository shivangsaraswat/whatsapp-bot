# Docker Setup Guide

## Prerequisites
- Docker installed
- Docker Compose installed (optional but recommended)
- `credentials.json` file in project root

## Quick Start with Docker Compose

### 1. Build and Start
```bash
docker-compose up -d
```

### 2. View QR Code (First Time)
```bash
docker-compose logs -f whatsapp-bot
```
Scan the QR code with WhatsApp to authenticate.

### 3. Stop Container
```bash
docker-compose down
```

### 4. View Logs
```bash
docker-compose logs -f whatsapp-bot
```

### 5. Restart Container
```bash
docker-compose restart
```

## Manual Docker Commands

### Build Image
```bash
docker build -t whatsapp-bot .
```

### Run Container
```bash
docker run -d \
  --name whatsapp-bot \
  -v $(pwd)/credentials.json:/app/credentials.json:ro \
  -v $(pwd)/config.js:/app/config.js:ro \
  -v whatsapp-auth:/app/.wwebjs_auth \
  -v whatsapp-cache:/app/.wwebjs_cache \
  -v $(pwd)/logs:/app/logs \
  whatsapp-bot
```

### View Logs
```bash
docker logs -f whatsapp-bot
```

### Stop Container
```bash
docker stop whatsapp-bot
```

### Remove Container
```bash
docker rm whatsapp-bot
```

## Important Notes

- **First Run**: You'll need to scan QR code to authenticate
- **Persistent Data**: WhatsApp session is saved in Docker volumes
- **Logs**: Available in `./logs` directory
- **Config Changes**: Restart container after modifying `config.js`
- **Credentials**: Ensure `credentials.json` exists before starting

## Troubleshooting

### QR Code Not Showing
```bash
docker-compose logs whatsapp-bot
```

### Clear Session and Re-authenticate
```bash
docker-compose down -v
docker-compose up -d
```

### Update Code
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```
