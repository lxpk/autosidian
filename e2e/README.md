# Integration & E2E testing (Autosidian)

## Which vault to use when testing in the app

**Default on macOS:** if the iCloud **`autosidian`** folder already exists on disk, **`npm test`** / integration **sync the built plugin there automatically** (no env var required):

`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/autosidian`

Same path as `ICLOUD_AUTOSIDIAN_VAULT_DARWIN` in [e2e/helpers/paths.mjs](helpers/paths.mjs).

**Overrides:**

- **`AUTOSIDIAN_E2E_VAULT`** — use a different vault (absolute path or `~/…`).
- **`AUTOSIDIAN_E2E_USE_FIXTURE=1`** — always use the repo’s [e2e/fixture-vault/](fixture-vault/) (e.g. compare against CI, or avoid touching iCloud).
- **Linux / no iCloud folder** — integration uses [e2e/fixture-vault/](fixture-vault/) (this is what **CI** does).

Then run `npm run test:integration` (or full `npm test`) and optionally `npm run test:e2e` or `npm run test:integration:open`.

**`obsidian://open?path=…`** only works for paths **inside a vault already in Obsidian’s vault list**. The bundled fixture is often **not** registered, so the URI is skipped for the fixture unless **`AUTOSIDIAN_E2E_URI=1`** after you open the fixture as a vault once. When using the iCloud vault (default on Mac) or any non-fixture path, the URI is used unless **`AUTOSIDIAN_E2E_URI=0`**.

## 1. Build + sync + verify (automated, CI)

Runs as part of **`npm test`** via `test:integration`:

1. **Typecheck + bundle** — same as `npm run build`.
2. **Sync** — copies `main.js`, `manifest.json`, and `styles.css` into the active E2E vault’s `.obsidian/plugins/autosidian/` (default: iCloud `autosidian` on macOS when that folder exists; else [e2e/fixture-vault](fixture-vault/) — see [paths.mjs](helpers/paths.mjs)).
3. **Verify** — asserts `manifest.json` is present, `id` is `autosidian`, and `main.js` exists.

No Obsidian app is required. This catches bad builds and missing files before you open the desktop app.

## 2. Desktop UI test (local, optional)

**`npm run test:e2e`** runs (1) then drives the **real Obsidian window** with **[Puppeteer over Chrome DevTools Protocol](https://pptr.dev/)** (`puppeteer-core` — it attaches to Obsidian’s own Chromium; no separate browser install).

**Which vault opens?** The harness does two things so you are **not** stuck on a previously used vault:

1. **macOS** — A **new** app instance is started with `open -n -a "…/Obsidian.app" --args <E2E vault> --remote-debugging-port=…` so a fresh window is created.
2. **When not using the bundled fixture (e.g. default iCloud vault on Mac) or `AUTOSIDIAN_E2E_URI=1`** — Right after CDP connects, the script may issue  
   `obsidian://open?path=<absolute path to …/.obsidian/app.json>`.  
   Per [Obsidian’s URI help](https://obsidian.md/help/uri), that only works if the path is **inside a registered vault** (hence we skip it for the default unregistered fixture).

The script then opens **Settings (⌘, / Ctrl+,)** and checks the Autosidian settings tab. Use **English** UI unless you change the E2E script strings.

**Optional** — set **`SKIP_E2E=1`** to skip the UI step, or set **`OBSIDIAN_PATH`** if the executable is not in the usual place.

### Manual workflow (no automation)

```bash
npm run test:integration:open
```

Uses **`obsidian://`** when the vault is expected to be registered; otherwise opens the E2E folder with **`open -a Obsidian …`** (macOS) or the Obsidian binary + path. Then use [UI.md](../UI.md) as a manual checklist.

### CI

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs **`npm test` only** (unit + integration against **fixture-vault**). **E2E is not run in GitHub-hosted CI** by default. Run **`npm run test:e2e`** on your machine before a release, or on a self-hosted runner with Obsidian + display.

## 3. Layout

| Path | Role |
|------|------|
| [e2e/fixture-vault/](fixture-vault/) | Default E2E vault in CI; `community-plugins.json` can list `["autosidian"]` for scripted checks. |
| [e2e/scripts/](scripts/) | `sync-plugin.mjs`, `verify-snapshot.mjs`, [resolve-obsidian.mjs](scripts/resolve-obsidian.mjs), [open-obsidian.mjs](scripts/open-obsidian.mjs). |
| [e2e/helpers/](helpers/) | CDP launch + [paths.mjs](helpers/paths.mjs) (`E2E_VAULT`, `E2E_SHOULD_OPEN_VAULT_URI`, iCloud path). |
| [e2e/spec/autosidian-settings.mjs](spec/autosidian-settings.mjs) | E2E UI script. |
