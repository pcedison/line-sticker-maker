import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appDir, '..');

const run = (command, cwd) => {
  execSync(command, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
};

const read = (command, cwd) =>
  execSync(command, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: process.env,
  })
    .toString()
    .trim();

run('git fetch origin', repoRoot);

const worktreeDirty = read('git status --porcelain', repoRoot).length > 0;

if (worktreeDirty) {
  console.error('');
  console.error(
    'Sync aborted: the working tree has local changes. Commit or stash them before syncing preview.'
  );
  process.exit(1);
}

const currentBranch = read('git branch --show-current', repoRoot);

if (currentBranch !== 'preview') {
  run('git switch preview', repoRoot);
}

run('git pull --ff-only origin preview', repoRoot);
run('node scripts/init-env.mjs', appDir);
run('npm install', appDir);

console.log('');
console.log('Preview sync complete.');
console.log(`- Repo: ${repoRoot}`);
console.log('- Branch: preview');
console.log('- Local placeholder env ensured: vitejs-vite/.env');
console.log('- Dependencies refreshed with npm install');
