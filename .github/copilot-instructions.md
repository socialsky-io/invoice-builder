<!-- GitHub Copilot / AI agent instructions for contributors working on invoice-builder -->

Purpose

- Provide concise, actionable guidance so an AI coding agent can be productive immediately.

Big picture (what this repo is)

- Electron + Vite + React desktop app. Renderer lives in `src/renderer`, main (Electron) code in `src/main`, and preload in `src/preload`.
- Development uses three concurrent build/watch targets: renderer (Vite dev server), preload (CJS build), and main (CJS build) — see `package.json` scripts.

Key files and example references

- Dev & build scripts: `package.json` (`npm run dev`, `npm run build`).
- Electron entry: `src/main/main.ts` (creates BrowserWindow, reads `VITE_DEV_SERVER_URL`).
- IPC handlers: `src/main/ipcHandler.ts` — canonical list of IPC channels and server-side logic.
- Preload exposures: `src/preload/preload.ts` — the single source of truth for `window.electronAPI` methods available to renderer.
- DB setup & schema: `src/main/database.ts` — app uses SQLite via `sqlite3`, creates tables and initial data.
- DB helpers: `src/main/functions.ts` — promisified helpers `runDb`, `getFirstRow`, `getAllRows` and boolean<->int conversions.

Dev / Build / Test workflows (exact commands)

- Run full dev environment (watch builds + launch):
  - `npm run dev` (runs `dev:react`, `dev:preload`, `dev:electron`, `dev:electron:start`).
- Build for production:
  - `npm run build` (runs `build:react`, `build:preload`, `build:electron`).
- Test: `npm test` (Vitest); coverage: `npm run test:coverage`.
- Lint/format: `npm run lint`, `npm run format`, `npm run lint:fix`.

Important environment variables

- `VITE_DEV_SERVER_URL` — if set, `main.ts` loads renderer from dev server (useful during `npm run dev`).
- `VITE_DB_NAME` — database filename (defaults to `app_database.db`).
- `VITE_ENABLE_MOCKS` — when true, renderer will start MSW mocks (`src/renderer/mocks/browser`).

IPC / Integration patterns (what to follow)

- All renderer <-> main communication must use `window.electronAPI` as defined in `src/preload/preload.ts`.
  - Example call from renderer: `const resp = await window.electronAPI.getAllClients()`.
- When adding a new IPC channel:
  1. Add handler in `src/main/ipcHandler.ts` (register with `ipcMain.handle`).
  2. Expose a matching function in `src/preload/preload.ts` (contextBridge.exposeInMainWorld).
  3. Add typed renderer wrapper (update `src/renderer/types/*` definitions if necessary).
- Note: `contextIsolation: true` and `nodeIntegration: false` — never rely on `window.require` or direct `ipcRenderer` in renderer.

Database & types notes

- SQLite is used via `sqlite3`. Booleans are stored as 0/1; helpers in `functions.ts` convert booleans for queries.
- Initial data and schema live in `src/main/database.ts` — modifying schema requires coordinated updates to `init()` and potential migrations.

Build outputs & path aliases

- Preload build -> `dist-electron/preload/preload.cjs` (consumed by BrowserWindow preload). See `vite.preload.config.ts`.
- Main build -> `dist-electron/main/main.cjs`. See `vite.electron.config.ts`.
- Renderer build -> `dist/` (regular Vite build). See `vite.config.ts`.
- Path aliases: `@` => `src`, `@main` => `src/main` (configured in Vite configs).

Tests, mocks, and local development notes

- Tests: Vitest configured in `vite.config.ts` (setup: `setupTests.ts`).
- MSW: mock server lives in `src/renderer/mocks` and controlled by `VITE_ENABLE_MOCKS`.

Code conventions & safe edits

- TypeScript-first. Keep types in `src/renderer/types` and `src/main/types` in sync when changing IPC payloads.
- Follow existing naming: IPC channels use kebab-case (e.g. `get-all-clients`) and preload methods use camelCase (e.g. `getAllClients`).
- Error handling: many main-side handlers return `{ success: boolean, ... }`. Preserve that shape when adding handlers.

When you change IPC signatures or DB schema, update these files together

- `src/main/ipcHandler.ts` (handler logic)
- `src/preload/preload.ts` (exposed api)
- `src/renderer/types/*` (renderer types)
- `src/main/types/*` (main side types)

What I couldn't detect automatically

- Packaging config for electron-builder is minimal in `package.json.build`; if you modify packaging behavior check `electron-builder` docs and test on target OS.
- Any native modules may require `electron-rebuild` during native dependency changes.

If something is unclear or you want this expanded (example-based walkthrough, more file pointers, or automation scripts), tell me which area to expand.
