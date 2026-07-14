const { spawn } = require('child_process');
const path = require('path');

const npmCommand = process.platform === 'win32' ? 'cmd.exe' : 'npm';
const npmArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run dev'] : ['run', 'dev'];

console.log('==================================================================');
console.log('Starting ClarityDesk.ai Development Servers (Backend & Frontend)...');
console.log('==================================================================');

const backend = spawn(npmCommand, npmArgs, {
  cwd: path.join(__dirname, 'backend'),
  windowsHide: false
});

const frontend = spawn(npmCommand, npmArgs, {
  cwd: path.join(__dirname, 'frontend'),
  windowsHide: false
});

backend.stdout.on('data', (data) => {
  const output = data.toString().trim();
  if (output) console.log(`[Backend] ${output}`);
});

backend.stderr.on('data', (data) => {
  const output = data.toString().trim();
  if (output) console.error(`[Backend ERROR] ${output}`);
});

frontend.stdout.on('data', (data) => {
  const output = data.toString().trim();
  if (output) console.log(`[Frontend] ${output}`);
});

frontend.stderr.on('data', (data) => {
  const output = data.toString().trim();
  if (output) console.error(`[Frontend ERROR] ${output}`);
});

process.on('SIGINT', () => {
  console.log('\nShutting down ClarityDesk.ai...');
  backend.kill();
  frontend.kill();
  process.exit();
});
