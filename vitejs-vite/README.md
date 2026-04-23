# Line Sticker Master Toolkit

React + Vite frontend for a modular LINE sticker workflow tool.

## Scripts
- `npm run dev`
- `npm run dev:live`
- `npm run build`
- `npm run lint`
- `npm run check`
- `npm run ready`
- `npm run sync:preview`
- `npm run env:init`
- `npm run verify:local-gemini`
- `npm run setup:dev`

## Environment
Create a local `.env` file in this directory:

```env
VITE_GEMINI_API_KEY=your_key_here
```

Do not commit `.env`.

If you want a ready-to-edit placeholder file, run:

```bash
npm run env:init
```

Each computer should keep its own local `.env`. Local development is the
supported workflow for live Gemini features.

## Architecture
- `src/app`: application shell
- `src/features`: product workflows grouped by feature
- `src/lib`: shared configuration, API, file, download, and image utilities

## Notes
- This project intentionally keeps image processing in the browser.
- If the product is exposed publicly, moving Gemini access behind a proxy remains strongly recommended.

## Quick Verification
- Run `npm run dev:live` to start a local live preview with your local Gemini key and open the app in the browser.
- Open the generator with `?lab=1` to reveal the built-in test kit and load `hero.png` without manual upload.
- Run `npm run smoke:ui` to start a local Vite server with a dummy Gemini key, mock Gemini in Playwright, and verify the full generator flow end to end.
- Run `npm run verify:local-gemini` to check whether the local `.env` contains a usable Gemini key and to make a live Gemini text request.
- Run `npm run setup:dev` on a fresh machine to install dependencies, install Chromium for Playwright, create a local `.env` placeholder, and run the local readiness checks.
- Run `npm run sync:preview` before starting work on a different computer to fast-forward the local checkout to `origin/preview`, ensure `.env` exists, and refresh dependencies.

## Local-First Workflow
1. Run `npm run sync:preview` before you start work on a machine.
2. Keep the local Gemini key in `.env`.
3. Run `npm run dev:live` to preview the app with live AI enabled.
4. When the session is done, ask Codex to sync the current work to the repo.
