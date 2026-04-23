# Line Sticker Master Toolkit

GitHub `preview` is the single source of truth for this project.

## Workspace
- Product docs: `SPEC.md`, `Tasks.md`
- Frontend app: `vitejs-vite/`

## Local Development
```bash
cd vitejs-vite
npm install
npm run dev:live
```

For a fresh machine bootstrap:

```bash
cd vitejs-vite
npm run setup:dev
```

Before starting work on another computer, sync the local checkout to the latest
GitHub preview branch:

```bash
cd vitejs-vite
npm run sync:preview
```

## Daily Workflow
1. Start on any computer by running `npm run sync:preview`.
2. Keep your local Gemini key in `vitejs-vite/.env`.
3. Run `npm run dev:live` for local AI-enabled preview.
4. When you finish work, ask Codex to sync the current work to the repo.
5. Continue on another computer by syncing `preview` again.

## Quality Checks
```bash
cd vitejs-vite
npm run check
```

## One-Click Publish
Use the publish helper from the project root:

```bash
./scripts/publish.sh "your commit message"
```

The script will:
- run `npm run check` inside `vitejs-vite`
- stage all tracked and untracked changes
- create a commit on the current branch
- push to `origin/<current-branch>`

Keep active development on the `preview` branch so every local change can be
published to the shared GitHub source of truth.

## Environment Variables
Create `vitejs-vite/.env` locally:

```env
VITE_GEMINI_API_KEY=your_key_here
```

Each computer keeps its own local `.env`. Do not commit it.

Verification commands:

```bash
cd vitejs-vite
npm run verify:local-gemini
```

## Recommended Workflow
1. Keep active development on the `preview` branch.
2. Develop and test primarily on your local machine.
3. Let Codex publish the latest changes from `preview`.
4. Use local `npm run dev:live` for AI-enabled preview.
5. On the next computer, sync `preview` and continue.

## Branch Roles
- `main`: stable baseline
- `preview`: active development and cross-device sync branch

## Links
- GitHub repo: [pcedison/line-sticker-maker](https://github.com/pcedison/line-sticker-maker)
- Stable branch on GitHub: [main branch](https://github.com/pcedison/line-sticker-maker/tree/main)
