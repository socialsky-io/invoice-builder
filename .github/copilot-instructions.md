<!-- GitHub Copilot / AI agent instructions for contributors working on invoice-builder -->

Purpose

- Short, actionable notes so an AI coding agent can be productive immediately in this repo.

Big picture

- Electron app with three runtime parts:
  - Renderer: React + Vite (src/renderer). Runs in a BrowserWindow with `contextIsolation: true`.
  - Preload: small CJS bundle (src/preload) that exposes a curated `window.electronAPI` surface.
  - Main: Electron main process (src/main) that manages the app lifecycle and SQLite DB.
  - Reasoning: app separates platform code (DB, file dialogs) from UI, keeping renderer sandboxed.

Key files to read first

- `package.json` — dev scripts and which builds run concurrently (`npm run dev`).
- `src/main/main.ts` — BrowserWindow creation, dev server detection, and IPC handlers for DB setup.
- `src/preload/preload.ts` — central source of safe APIs exposed to the renderer (see `electronAPI`).
- `src/main/ipcHandler.ts` — canonical IPC handlers for CRUD and utility operations; includes a global guard to avoid double-registration.
- `src/main/database.ts` — DB init / schema / seeding and `setupDB({ fullPath })` behaviour (idempotent; closes old DB when switching path).
- `src/renderer/app/App.tsx` and `src/renderer/components/databaseChooser/DatabaseChooser.tsx` — renderer DB-chooser UX and saved-DB list logic.

Developer workflows (exact commands)

- Dev (watch builds + open Electron):
  - `npm run dev` (runs `dev:react`, `dev:preload`, `dev:electron`, then `dev:electron:start`).
- Build bundles:
  - `npm run build` (renderer + preload + main) — outputs: `dist/`, `dist-electron/preload/preload.cjs`, `dist-electron/main/main.cjs`.
- Tests & checks:
  - `npm test` (Vitest)
  - `npm run test:coverage`
  - `npm run lint`, `npm run format`

Environment specifics

- `VITE_DEV_SERVER_URL` — if present main loads dev server URL instead of built `dist/index.html`.
- `VITE_DB_NAME` / `VITE_APP_NAME` — used by default setup; the app also supports user-chosen DB path via the UI.
- `VITE_ENABLE_MOCKS` — toggles MSW mocks in renderer.

IPC / change pattern (exact steps)

1. Add/modify handler in `src/main/ipcHandler.ts` (use `ipcMain.handle('my-channel', handler)`). Keep return shape `{ success: boolean, ... }`.
2. Expose in `src/preload/preload.ts` with `contextBridge.exposeInMainWorld('electronAPI', { myApi: () => ipcRenderer.invoke('my-channel') })`.
3. Add types in `src/renderer/types/*` and `src/main/types/*` to keep payloads synced.
4. Use the API in renderer code (`window.electronAPI.myApi()`), handle `success`/`message`/`key` fields.

DB selection & UX specifics

- DB schema & seeding live in `src/main/database.ts`. Changes to schema must be reflected there and tested.
- Renderer flow:
  - Renderer checks DB readiness.
  - User picks path with `electronAPI.selectDatabase()` (native save dialog).
  - Renderer calls `electronAPI.initializeDatabase({ fullPath })` to set up or open DB.
- Saved DB list: renderer stores remembered DB paths in `localStorage` (see `DatabaseChooser.tsx` and `App.tsx`). Search for `databases` to find current keys.

Common pitfalls & fixes

- Re-initializing DB: `setupDB` will close an existing DB when switching to a different path. If you see errors about duplicate handlers or failing `open-url` registration, ensure you are not re-calling init or reloading the main process incorrectly.
- Preload API changes: always update renderer types and avoid direct `ipcRenderer` calls in renderer.

Where to change for a feature

- IPC additions: `src/main/ipcHandler.ts`, `src/preload/preload.ts`, `src/renderer/types/*`, `src/main/types/*`, then renderer components/hooks.
- DB migrations: `src/main/database.ts` (no migration system currently — add one when needed).
- Setup UI: `src/renderer/components/databaseChooser/*` and `src/renderer/app/App.tsx`.

If you want a sample PR that adds a new IPC channel, a migration template, or a styled DatabaseChooser using MUI, tell me which one and I will implement it.

<!-- GitHub Copilot / AI agent instructions for contributors working on invoice-builder -->
