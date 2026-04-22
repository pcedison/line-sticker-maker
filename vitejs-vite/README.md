# Line Sticker Master Toolkit

React + Vite frontend for a modular LINE sticker workflow tool.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run check`

## Environment
Create a local `.env` file in this directory:

```env
VITE_GEMINI_API_KEY=your_key_here
```

Do not commit `.env`.

If you are using StackBlitz from the GitHub preview URL, prefer setting
`VITE_GEMINI_API_KEY` in `Settings > Variables` for the repository scope
`pcedison/line-sticker-maker`. A fresh GitHub-backed workspace may not keep a
manually created temporary `.env` file.

## Architecture
- `src/app`: application shell
- `src/features`: product workflows grouped by feature
- `src/lib`: shared configuration, API, file, download, and image utilities

## Notes
- This project intentionally keeps image processing in the browser.
- If the product is exposed publicly, moving Gemini access behind a proxy remains strongly recommended.

## Quick Verification
- Open the generator with `?lab=1` to reveal the built-in test kit and load `hero.png` without manual upload.
- Run `npm run smoke:ui` to start a local Vite server with a dummy Gemini key, mock Gemini in Playwright, and verify the full generator flow end to end.
