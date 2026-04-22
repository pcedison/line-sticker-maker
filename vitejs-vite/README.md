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

## Architecture
- `src/app`: application shell
- `src/features`: product workflows grouped by feature
- `src/lib`: shared configuration, API, file, download, and image utilities

## Notes
- This project intentionally keeps image processing in the browser.
- If the product is exposed publicly, moving Gemini access behind a proxy remains strongly recommended.
