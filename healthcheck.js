const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.HEALTH_PORT || 3001;

// Simple health check server
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    // Check if logs directory exists and app.log has recent entries
    const logFile = path.join(__dirname, 'logs', 'app.log');
    let status = 'healthy';
    let lastActivity = null;

    try {
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        lastActivity = stats.mtime;
        
        // If log file hasn't been modified in last 10 minutes, mark as unhealthy
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (stats.mtime < tenMinutesAgo) {
          status = 'unhealthy';
        }
      } else {
        status = 'starting';
      }
    } catch (error) {
      status = 'error';
    }

    const response = {
      status,
      timestamp: new Date().toISOString(),
      lastActivity,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    res.writeHead(status === 'healthy' ? 200 : 503, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(response, null, 2));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});

module.exports = server;