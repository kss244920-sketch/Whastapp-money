#!/usr/bin/env node
/**
 * postinstall.js — runs after `npm install`.
 * Skips Chromium download if a system browser is found or
 * PUPPETEER_SKIP_DOWNLOAD is already set.
 */

const fs = require('fs');
const { spawnSync } = require('child_process');
const CANARY = 'node_modules/puppeteer/install.js';

function findBrowserPath() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.PROGRAMFILES  ? `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`       : null,
    process.env.PROGRAMFILES  ? `${process.env.PROGRAMFILES}\\(x86)\\Google\\Chrome\\Application\\chrome.exe` : null,
    process.env.PROGRAMFILES  ? `${process.env.PROGRAMFILES}\\Microsoft\\Edge\\Application\\msedge.exe`       : null,
    process.env.LOCALAPPDATA  ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`        : null,
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge', '/opt/google/chrome/chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ];
  for (const c of candidates) { if (c && fs.existsSync(c)) return c; }
  return null;
}

function main() {
  // Always skip — we rely on the system Chrome/Edge/Chromium.
  // Puppeteer's bundled download often fails on Windows paths with spaces,
  // on restricted networks, and on cloud hosts where Chromium comes from apt.
  const browser = findBrowserPath();
  if (browser) {
    console.log(`[postinstall] System browser found: ${browser}`);
  } else {
    console.log('[postinstall] No system browser detected — bridge will use puppeteer default.');
    console.log('[postinstall] Install Chrome or Edge if the bot cannot open WhatsApp.');
  }
  console.log('[postinstall] Skipping Chromium download (set PUPPETEER_SKIP_DOWNLOAD=true).');
  // Force the env var for any child processes
  process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';
}

main();
