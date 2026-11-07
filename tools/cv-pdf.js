#!/usr/bin/env node
// Prints cv.html to assets/cv.pdf with headless Chrome.
// Run `node build.js` first, so that bundle.js is fresh. The page loads React from unpkg, so the machine needs a network.
// Set CHROME_PATH to use another Chrome. The tool serves the folder over http for the print, because file:// can fail.
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'assets', 'cv.pdf');
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };

if (!fs.existsSync(chrome)) {
  console.error(`Chrome not found at ${chrome}. Set CHROME_PATH.`);
  process.exit(1);
}

const server = http.createServer((request, response) => {
  const file = path.join(root, decodeURIComponent(request.url.split('?')[0]));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
});

server.listen(0, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${server.address().port}/cv.html`;
  const profile = fs.mkdtempSync(path.join(require('os').tmpdir(), 'cv-pdf-'));
  // An async spawn keeps this process free to answer the page requests.
  const child = spawn(chrome, [
    '--headless=new', '--disable-gpu', `--user-data-dir=${profile}`,
    `--print-to-pdf=${output}`, '--no-pdf-header-footer', '--virtual-time-budget=15000', url,
  ], { stdio: 'inherit' });
  child.on('exit', code => {
    server.close();
    fs.rmSync(profile, { recursive: true, force: true });
    if (code !== 0 || !fs.existsSync(output)) {
      console.error('Chrome did not write the PDF.');
      process.exit(1);
    }
    console.log(`Wrote ${output} (${fs.statSync(output).size} bytes).`);
  });
});
