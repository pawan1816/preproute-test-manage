const express = require('express');
const http = require('https');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const distPath = path.join(__dirname, 'dist');
const BACKEND = process.env.BACKEND_HOST || 'admin-moderator-backend-staging.up.railway.app';

// API proxy — pipe requests to the external backend
app.use('/api', (req, res) => {
  const options = {
    hostname: BACKEND,
    port: 443,
    path: req.originalUrl, // includes /api prefix
    method: req.method,
    headers: {
      ...req.headers,
      host: BACKEND,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Forward CORS headers from backend
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Proxy error', details: err.message });
    }
  });

  // Pipe request body
  req.pipe(proxyReq, { end: true });
});

// Serve static files from dist
app.use(express.static(distPath));

// SPA fallback — serve index.html for everything else
app.use((req, res) => {
  const indexFile = path.join(distPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});