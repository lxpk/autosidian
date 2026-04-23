# Changelog

## Unreleased

- **E2E / integration** — [paths.mjs](e2e/helpers/paths.mjs): **`E2E_SHOULD_OPEN_VAULT_URI`** — only use `obsidian://open?path=…` when **`AUTOSIDIAN_E2E_VAULT`** is set or **`AUTOSIDIAN_E2E_URI=1`**; the bundled fixture is usually not a registered Obsidian vault (“vault not found” otherwise). [open-obsidian.mjs](e2e/scripts/open-obsidian.mjs) falls back to `open -a` / binary + folder. [e2e/README.md](e2e/README.md) updated.

## 1.0.0 — 2026-04-23

- **Settings v3** — [src/settings.ts](src/settings.ts): `waypoint`, `iconize` (rules + front matter), `pixelBanner` (Picsum URLs + front matter), `autosidia` (registry URL). [migrateSettings.ts](src/migrateSettings.ts) merges v2 data.
- **Phase 2 — Waypoint:** [waypoint/](src/waypoint/) — insert `%% Waypoint %%` when folder note has subfolders; new file + new subfolder handlers; [retro](src/waypoint/retroactiveWaypointQueue.ts); command `autosidian-add-waypoint`. File menu.
- **Phase 3 — Iconize:** [iconize/](src/iconize/) — longest keyword match → `icon` on folder note; create/rename; [retro](src/iconize/retroactiveIconizeQueue.ts); command `autosidian-apply-icon-selection`. Requires user’s Iconize front matter setup.
- **Phase 4 — Pixel Banner:** [pixelBanner/](src/pixelBanner/) — [picsum.photos](https://picsum.photos) placeholder URLs; new-note banner; [retro](src/pixelBanner/retroactivePixelQueue.ts); [BannerPickModal](src/pixelBanner/BannerPickModal.ts) + command `autosidian-pick-banner-candidates`. Uses `metadataCache` to find notes without `banner`.
- **Phase 5 — Quality:** [vitest](vitest.config.ts) + `src/**/*.test.ts` (excluded from plugin `tsc`); `npm test` = vitest + build. [package.json](package.json) `test:unit`.
- **Phase 6 (stub) — Autosidia:** [AutosidiaClient.ts](src/autosidia/AutosidiaClient.ts) `GET {base}/health`; [presets](src/presets/presetIO.ts) JSON export/import. Full registry still external.
- **UI:** [moreSettings.ts](src/ui/moreSettings.ts) for all sections; [main.ts](src/main.ts) halts all retro queues on unload.

## 0.2.0 — 2026-04-23

- **Auto–Folder Notes (initial):** settings `folderNotes` (new folders, new notes, retro + slider 1–120/min), [migrateSettings.ts](src/migrateSettings.ts), [folderNotes/](src/folderNotes/) (ensure, convert, iter, [retro](src/folderNotes/retroactiveQueue.ts), [register](src/folderNotes/registerFolderNotesFeature.ts)), [safePath.ts](src/safePath.ts) to skip [`.obsidian`](https://help.obsidian.md) paths. [Vault](https://docs.obsidian.md) `create` (inside `onLayoutReady`), reentry `Set` to avoid double-creating on convert. Command *Convert active note to folder with folder note*; file context menu. [UI.md](UI.md) / [SPEC.md](SPEC.md) / [ARCHITECTURE.md](ARCHITECTURE.md) / [PLANS.md](PLANS.md) / [TODO.md](TODO.md) updated.
- [manifest.json](manifest.json) / [package.json](package.json) version `0.2.0`; [versions.json](versions.json) entry.

## Before 0.2.0 (summary)

- **0.1.x scaffold, Apache license, author, PLANS, CI, docs tree** — see git history; **License:** [Apache-2.0](LICENSE.txt). **CI:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
- **Plugin (scaffold):** TypeScript + esbuild, [src/main.ts](src/main.ts), [src/settings.ts](src/settings.ts), [src/ui/AutosidianSettingTab.ts](src/ui/AutosidianSettingTab.ts), [src/deps/requiredPlugins.ts](src/deps/requiredPlugins.ts) (`pexels-banner`). [AGENTS.md](AGENTS.md) planning cycle. Renamed `CODE_OF_CONDUCT.md:` → `CODE_OF_CONDUCT.md`.
- Documentation: [README](README.md), [SPEC](SPEC.md), [UI](UI.md), [ARCHITECTURE](ARCHITECTURE.md), [API](API.md), [CONTRIBUTING](CONTRIBUTING.md), [SUPPORT](SUPPORT.md), [SECURITY](SECURITY.md), [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md), [AGENTS](AGENTS.md). **Autosidian** vs **Autosidia**.