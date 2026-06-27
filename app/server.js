const http = require('http');
const os = require('os');

const PORT = process.env.PORT || 3000;
const APP_ENV = process.env.APP_ENV || 'development';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const DB_PASSWORD = process.env.DB_PASSWORD ? '[REDACTED]' : 'NOT SET';

let isReady = false;

// Simulate startup delay (readiness probe will wait for this)
setTimeout(() => {
  isReady = true;
  console.log('Application is ready to serve traffic');
}, 5000);

const server = http.createServer((req, res) => {

  // Liveness probe endpoint
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'alive', uptime: process.uptime() }));
    return;
  }

  // Readiness probe endpoint
  if (req.url === '/ready') {
    if (isReady) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ready' }));
    } else {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'not ready yet' }));
    }
    return;
  }

  // Main response
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Hello from Production K8s App!',
    pod: os.hostname(),
    environment: APP_ENV,
    version: APP_VERSION,
    db_password_set: DB_PASSWORD,
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} | ENV: ${APP_ENV} | Version: ${APP_VERSION}`);
});