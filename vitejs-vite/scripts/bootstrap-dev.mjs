import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, '..');
const envPath = path.join(appDir, '.env');

const run = (command, options = {}) => {
  const { allowFailure = false } = options;

  try {
    execSync(command, {
      cwd: appDir,
      stdio: 'inherit',
      shell: true,
      env: process.env,
    });
    return true;
  } catch (error) {
    if (!allowFailure) {
      throw error;
    }

    return false;
  }
};

run('node scripts/init-env.mjs');
run('npm install');
run('npx playwright install chromium');
run('npm run ready');

const hasLocalEnv = fs.existsSync(envPath);
const localCheckPassed = hasLocalEnv
  ? run('node scripts/verify-local-gemini.mjs', { allowFailure: true })
  : false;

console.log('');
console.log('Bootstrap summary:');
console.log(`- Local .env present: ${hasLocalEnv ? 'yes' : 'no'}`);
console.log(`- Local Gemini live check: ${localCheckPassed ? 'passed' : 'not ready'}`);
