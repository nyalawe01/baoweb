#!/usr/bin/env node
/**
 * Babawatoto Organization (BAO) Administrative CMS — cPanel Phusion Passenger Startup File
 * Application Root: /home/babawatotoor/bao-cms
 * Startup File: cpanel-start.cjs (or dist/server.js)
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

import('./dist/server.js').catch((err) => {
  console.error('[cPanel Startup Error - bao-cms]:', err);
  process.exit(1);
});

