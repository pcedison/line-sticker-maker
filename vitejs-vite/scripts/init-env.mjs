import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, '..');
const envExamplePath = path.join(appDir, '.env.example');
const envPath = path.join(appDir, '.env');

if (!fs.existsSync(envExamplePath)) {
  console.error(`Missing .env.example at ${envExamplePath}`);
  process.exit(1);
}

if (fs.existsSync(envPath)) {
  console.log(`.env already exists: ${envPath}`);
  process.exit(0);
}

const template = fs.readFileSync(envExamplePath, 'utf8');
fs.writeFileSync(envPath, template.endsWith('\n') ? template : `${template}\n`);

console.log(`Created local .env from .env.example: ${envPath}`);
