# Line 貼圖全能工具箱
## Delivery Tasks

Legend:
- `[x]` done
- `[-]` in progress
- `[ ]` planned

## 1. Foundation
- [x] Rewrite the product and engineering specification into a maintainable v2 document.
- [x] Create a task backlog that separates architecture, UX, reliability, and release work.
- [x] Convert the current single-file implementation into feature modules.
- [x] Move Gemini access behind shared service utilities.
- [x] Replace hardcoded API key usage with environment-based configuration.
- [x] Replace runtime JSZip CDN loading with an installed package.
- [x] Replace HTML-injected Tailwind CDN usage with managed build-time Tailwind.
- [x] Add `.env` handling notes to all developer-facing docs.

## 2. Generator
- [x] Extract generator workflow into `features/generator`.
- [ ] Add richer validation and error states for inspiration JSON parsing.
- [ ] Add better controls for generation history and variant comparison.
- [ ] Add export presets for sticker pack naming and download conventions.
- [ ] Improve crop heuristics for white characters and low-contrast art.

## 3. Resizer
- [x] Extract resizer workflow into `features/resizer`.
- [ ] Support additional official LINE asset presets when needed.
- [ ] Add multi-file resize queue for production workflows.

## 4. Background Remover
- [x] Extract background remover workflow into `features/bg-remover`.
- [x] Add cancel / stop processing for long-running batches.
- [ ] Improve progress feedback with completed, failed, and remaining counts.
- [ ] Refine green detection and edge protection to reduce false removals.
- [ ] Evaluate optional worker offloading for heavy local image processing.

## 5. Shared UX
- [x] Build a consistent app shell and tool panel structure.
- [ ] Replace blocking `alert` / `confirm` flows with in-app notification patterns.
- [ ] Improve mobile navigation and header overflow behavior.
- [ ] Add empty states, recovery actions, and missing-config guidance.

## 6. Quality
- [x] Make `npm run lint` pass cleanly.
- [ ] Add utility-level tests for filename sanitization, image bounds, and download helpers.
- [ ] Add CI validation for install, lint, and build.
- [ ] Add smoke checks for required environment variables.

## 7. Release Readiness
- [x] Add `README.md` usage, setup, and architecture notes aligned to the refactor.
- [x] Add `.env.example` and deployment instructions for local and hosted environments.
- [ ] Decide whether public production should keep pure frontend Gemini calls or move to a proxy.
