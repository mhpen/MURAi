/**
 * Script to restart the server after JWT_SECRET changes
 * This ensures the new secret is loaded
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.join(__dirname, '..');

console.log('Restarting server to apply JWT_SECRET changes...');

// Kill any running server processes
const killCommand = process.platform === 'win32' 
  ? 'taskkill /f /im node.exe' 
  : "pkill -f 'node server.js'";

exec(killCommand, (error) => {
  if (error) {
    console.log('No server process found to kill or error killing process');
  } else {
    console.log('Killed existing server process');
  }
  
  // Start the server again
  const startCommand = 'cd ' + serverDir + ' && node server.js';
  
  console.log('Starting server with new JWT_SECRET...');
  const serverProcess = exec(startCommand);
  
  serverProcess.stdout.on('data', (data) => {
    console.log(data);
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(data);
  });
  
  console.log('Server restart initiated. Please check server logs for status.');
});
