#!/usr/bin/env node
/**
 * Simple HTTP server for testing ProcessAdmin PWA
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname);

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.ico': 'image/x-icon',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let filepath = path.join(ROOT, decodeURIComponent(parsedUrl.pathname));
  
  // Security: prevent directory traversal
  if (!filepath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  // Handle directory requests
  if (fs.existsSync(filepath) && fs.statSync(filepath).isDirectory()) {
    filepath = path.join(filepath, 'index.html');
  }
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  
  try {
    const file = fs.readFileSync(filepath);
    const mimeType = getMimeType(filepath);
    
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': file.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'Service-Worker-Allowed': '/'
    });
    
    res.end(file);
  } catch (err) {
    console.error('Error serving file:', err);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`ProcessAdmin server running on http://localhost:${PORT}`);
  console.log(`Serving files from: ${ROOT}`);
  console.log('Press Ctrl+C to stop');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    console.error('Try a different port: PORT=3001 node server.js');
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\nServer shutting down...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
