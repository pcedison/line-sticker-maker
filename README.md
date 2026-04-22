# Line 貼圖全能工具箱

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/pcedison/line-sticker-maker/tree/main/vitejs-vite?title=Line%20Sticker%20Master%20Toolkit)

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

## Links
- GitHub repo: [pcedison/line-sticker-maker](https://github.com/pcedison/line-sticker-maker)
- StackBlitz app preview: [line-sticker-maker on StackBlitz](https://stackblitz.com/github/pcedison/line-sticker-maker/tree/main/vitejs-vite?title=Line%20Sticker%20Master%20Toolkit)
