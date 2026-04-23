import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, '..');
const envPath = path.join(appDir, '.env');
const viteBinPath = path.join(appDir, 'node_modules', 'vite', 'bin', 'vite.js');

if (!fs.existsSync(envPath)) {
  console.error('');
  console.error('Missing vitejs-vite/.env');
  console.error('Create the file first and add VITE_GEMINI_API_KEY.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const keyMatch = envContent.match(/^\s*VITE_GEMINI_API_KEY\s*=\s*(.+)\s*$/m);

if (!keyMatch || !keyMatch[1].trim()) {
  console.error('');
  console.error('Missing VITE_GEMINI_API_KEY in vitejs-vite/.env');
  console.error('Add your Gemini key first, then run this command again.');
  process.exit(1);
}

console.log('');
console.log('Starting local live preview with Gemini enabled...');
console.log('The browser should open automatically at http://localhost:5173/');

if (!fs.existsSync(viteBinPath)) {
  console.error('');
  console.error('Missing local Vite install.');
  console.error('Run npm install first, then try npm run dev:live again.');
  process.exit(1);
}

const child = spawn(process.execPath, [viteBinPath, '--open'], {
  cwd: appDir,
  stdio: 'inherit',
  shell: false,
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
