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

[iconize/](src/iconize/) — keyword → `icon` on folder note; [keyword tests](src/iconize/keywordMatch.test.ts); in-app [keyword table](src/ui/iconizeRuleTable.ts).

## Phase 4 — Auto–Pixel Banner *(v1.0+)*

[pixelBanner/](src/pixelBanner/) — `banner` keywords + Pixel Banner Pexels; modal picker, retro, [e2e folder-note script](e2e/scripts/apply-pixel-banner-to-folder-notes.mjs). **Follow-up:** other stock APIs (Unsplash, Cloudinary) with keys in [Obsidian Secret](https://docs.obsidian.md) if you want to bypass Pixel Banner’s own settings.

## Phase 5 — Quality *(v1.0+ started)*

- **Vitest** in CI — [migrateSettings](src/migrateSettings.test.ts) / [preset merge](src/presets/presetIO.test.ts) + existing tests.
- **Community store** — When ready, follow [CONTRIBUTING](CONTRIBUTING.md#publishing-to-the-community-plugin-list).

## Phase 6 — Autosidia *(stub v1.0+)*

[AutosidiaClient](src/autosidia/AutosidiaClient.ts) + [preset I/O](src/presets/presetIO.ts). **Next:** real backend, auth, catalog API — new repo or `apps/autosidia/` when you build it. Update [SPEC](SPEC.md#autosidia-community-registry) with URLs at launch.

## Longer horizon

i18n, mobile soak tests, index workers, optional 5th-party integrations — after core automation proven stable. [TODO.md](TODO.md) is clear; check there if new tasks are added.

## Review cadence

Revisit when a partner plugin ships breaking changes or when you cut **2.0.0** (e.g. settings schema v4).
