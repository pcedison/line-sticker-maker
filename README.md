# Line 貼圖全能工具箱

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/pcedison/line-sticker-maker/tree/preview/vitejs-vite?startScript=dev&title=Line%20Sticker%20Master%20Toolkit)

GitHub source of truth for the LINE sticker toolkit project.

## Workspace
- Product docs: `SPEC.md`, `Tasks.md`
- Frontend app: `vitejs-vite/`

## Local Development
```bash
cd vitejs-vite
npm install
npm run dev
```

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

For the live preview workflow, keep your local workspace on the `preview` branch.
That way every Codex-delivered change can be published to the StackBlitz preview URL directly.

## Environment Variables
Create `vitejs-vite/.env` locally:

```env
VITE_GEMINI_API_KEY=your_key_here
```

For StackBlitz, add the same variable in the project environment variable settings.

## Recommended Workflow
1. Keep active development on the `preview` branch.
2. Develop and test primarily on your local machine.
3. Let Codex publish the latest changes from `preview`.
4. Open the app in StackBlitz from the GitHub-backed preview URL above for cloud preview and cross-device checks.
5. Refresh or reopen the StackBlitz project after each push to validate the latest changes.

## Branch Roles
- `main`: stable baseline
- `preview`: always-on StackBlitz preview branch

## StackBlitz Notes
- Direct GitHub import works immediately when the repository is public.
- If the repository stays private, StackBlitz requires a private-repo capable workflow on the StackBlitz side.
- For this repository, the most reliable import URL is the one that points directly to `tree/<branch>/vitejs-vite`.
- If Chrome gets stuck on `Cloning repo from GitHub`, retry in an Incognito window first. If that works, the usual fix is clearing StackBlitz site data or allowing StackBlitz / WebContainer third-party storage and popups.

## Links
- GitHub repo: [pcedison/line-sticker-maker](https://github.com/pcedison/line-sticker-maker)
- StackBlitz live preview: [line-sticker-maker preview on StackBlitz](https://stackblitz.com/github/pcedison/line-sticker-maker/tree/preview/vitejs-vite?startScript=dev&title=Line%20Sticker%20Master%20Toolkit)
- Stable branch on GitHub: [main branch](https://github.com/pcedison/line-sticker-maker/tree/main)
