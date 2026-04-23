# Long-term plans

This file is the **strategic** roadmap. **TODO.md** holds near-term execution; this file is the **bigger** picture. See [CHANGELOG](CHANGELOG.md) and [1.0.0](CHANGELOG.md#100--2026-04-23) for what shipped in each release.

**Order of product phases** (README): **Folder Notes → Waypoint → Iconize → Pixel Banner** — **delivered in v0.2 / v1.0** in that order, plus **Presets/Autosidia stub** and **CI/tests**.

---

## Phase 0 — Foundation *(shipped v0.1)*

TypeScript + esbuild, manifest, required-plugin notice, [CI](.github/workflows/ci.yml).

## Phase 1 — Auto–Folder Notes *(v0.2+)*

[folderNotes](src/folderNotes/), reentry set, convert command, folder retro. See [PLANS](PLANS.md) history in [CHANGELOG](CHANGELOG.md).

## Phase 2 — Auto–Waypoint *(v1.0+)*

[waypoint/](src/waypoint/) — `%% Waypoint %%` for folder notes with subfolders; new file + new subfolder; [retro](src/waypoint/retroactiveWaypointQueue.ts). **Exit:** [UI.md](UI.md#autowaypoint) + tests for [waypoint markdown](src/waypoint/waypointMarkdown.test.ts).

## Phase 3 — Auto–Iconize *(v1.0+)*

[iconize/](src/iconize/) — keyword → `icon` front matter on folder note; [keyword tests](src/iconize/keywordMatch.test.ts). **Follow-up:** in-app table editor (optional).

## Phase 4 — Auto–Pixel Banner *(v1.0+)*

[pixelBanner/](src/pixelBanner/) — Picsum URLs, modal picker, retro. **Follow-up:** other image providers with keys in Secret storage.

## Phase 5 — Quality *(v1.0+ started)*

- **Vitest** in CI via `npm test` ([package.json](package.json)). Expand tests for [migrateSettings](src/migrateSettings.ts) / preset merge.
- **Community store** — When ready, use [plugin submission](https://github.com/obsidianmd/obsidian-releases/blob/master/PLUGIN_SUBMISSION.md) and README screenshot. See [CONTRIBUTING](CONTRIBUTING.md).

## Phase 6 — Autosidia *(stub v1.0+)*

[AutosidiaClient](src/autosidia/AutosidiaClient.ts) + [preset I/O](src/presets/presetIO.ts). **Next:** real backend, auth, catalog API — new repo or `apps/autosidia/` when you build it. Update [SPEC](SPEC.md#autosidia-community-registry) with URLs at launch.

## Longer horizon

i18n, mobile soak tests, index workers, optional 5th-party integrations — after core automation proven stable. See [TODO](TODO.md) for smaller follow-ups.

## Review cadence

Revisit when a partner plugin ships breaking changes or when you cut **2.0.0** (e.g. settings schema v4).
