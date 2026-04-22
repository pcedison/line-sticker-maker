# Line 貼圖全能工具箱

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/pcedison/line-sticker-maker?configPath=vitejs-vite&startScript=dev&title=Line%20Sticker%20Master%20Toolkit)

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

## Environment Variables
Create `vitejs-vite/.env` locally:

```env
VITE_GEMINI_API_KEY=your_key_here
```

For StackBlitz, add the same variable in the project environment variable settings.

## Recommended Workflow
1. Develop and test primarily on your local machine.
2. Commit and push this repository to update the canonical source.
3. Open the app in StackBlitz from the GitHub-backed URL above for cloud preview and cross-device checks.
4. Refresh or reopen the StackBlitz project after each push to validate the latest changes.

## StackBlitz Notes
- Direct GitHub import works immediately when the repository is public.
- If the repository stays private, StackBlitz requires a private-repo capable workflow on the StackBlitz side.

## Links
- GitHub repo: [pcedison/line-sticker-maker](https://github.com/pcedison/line-sticker-maker)
- StackBlitz app preview: [line-sticker-maker on StackBlitz](https://stackblitz.com/github/pcedison/line-sticker-maker?configPath=vitejs-vite&startScript=dev&title=Line%20Sticker%20Master%20Toolkit)
