# Specification

This document is the project specification: installation, dependencies, how Autosidian is intended to behave, and the **Autosidia** community registry. For UI detail see [UI.md](UI.md); for code layout see [ARCHITECTURE.md](ARCHITECTURE.md).

## Installation

### From Community Plugins (recommended, when published)

1. In Obsidian: **Settings → Community plugins** — turn off Restricted mode if needed.
2. **Browse** → search for **Autosidian** → **Install** → **Enable**.

### From source (development)

1. Clone the repository, then `npm install` and `npm test` (TypeScript `noEmit` + production `esbuild` bundle; see [package.json](package.json) scripts).
2. Watch mode: `npm run dev` — rebuilds `main.js` on change; reload the plugin in Obsidian after each build.
3. Install into a **test vault** by copying or symlinking the project into `<Vault>/.obsidian/plugins/autosidian/`. You need `manifest.json`, `main.js`, and `styles.css` in that folder. See [Obsidian’s plugin dev docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin).

**Minimum app version** is [manifest.json](manifest.json) `minAppVersion` (currently `1.6.0`); [versions.json](versions.json) maps releases to it.

## Prerequisites and dependencies

- **Obsidian:** `minAppVersion` in [manifest.json](manifest.json) (currently **1.6.0**). Keep in sync with [versions.json](versions.json) when cutting releases.
- **Required community plugins (always):**
  - [Folder Notes](https://github.com/LostPaul/obsidian-folder-notes) — for folder-note and folder click behavior.
  - [Waypoint](https://github.com/IdreesInc/Waypoint) — for `%% Waypoint %%` / `%% Begin Waypoint %%` behavior.
  - [Iconize](https://florianwoelki.github.io/obsidian-iconize/) — for folder icons.
  - [Pixel Banner](https://github.com/jparkerweb/pixel-banner) — for page banners; the plugin’s Obsidian `id` is `pexels-banner` (see its `manifest.json`). Related: [eQuillabs](https://www.equilllabs.com/projects/pixel-banner/).

**Manifest IDs (for support and this codebase):** `folder-notes`, `waypoint`, `obsidian-icon-folder` (Iconize), `pexels-banner` (Pixel Banner). Autosidian treats a dependency as present when the plugin is **enabled**; if missing, the settings tab shows a short notice.

## Functional summary

- **Auto–Folder Notes (v0.2+):** `Name/Name.md` for new folders (toggle), new-note → folder conversion (toggle), retroactive queue, command + file menu. [UI.md](UI.md#autofolder-notes).
- **Auto–Waypoint (v1.0+):** When a **folder note** is also a `Name/Name.md` and its **parent folder** has at least one **subfolder**, insert `%% Waypoint %%` (after front matter) if the body has neither the short token nor `%% Begin Waypoint %%`. Triggers: new such files, or when a new **subfolder** is created (optional toggle). Per-minute retro queue. [UI.md](UI.md#autowaypoint) · [waypoint](src/waypoint/).
- **Auto–Iconize (v1.0+):** Longest **keyword** match on the **folder name** → set configurable front matter (default `icon`) on the **folder note**; built-in + JSON-imported rules. New/rename folder + per-minute retro. [UI.md](UI.md#autoiconize) · [iconize](src/iconize/).
- **Auto–Pixel Banner (v1.0+):** Sets **`banner`** in front matter to **search keywords** (notably the note title) for [Pixel Banner](https://github.com/jparkerweb/pixel-banner) Pexels/API flow. New note (optional), retro, picker command, optional one-click Pexels settings. [UI.md](UI.md#autopixel-banner) · [pixelBanner](src/pixelBanner/).
- **Presets (v1.0+):** Copy/export JSON, import partial merge. [presets](src/presets/presetIO.ts).
- **Autosidia (stub, v1.0+):** Optional `registryBaseUrl` and **Ping** → `GET /health` only; no hosted service in-repo.

Details: [UI.md](UI.md). Integration points: [API.md](API.md). Structure: [ARCHITECTURE.md](ARCHITECTURE.md).

## Autosidia (community registry)

**Autosidia** is the name of the web app and registry for **sharing presets and configs** (keyword→icon sets, Autosidian settings bundles, and potentially presets useful to other plugins). The Obsidian plugin remains **Autosidian**; only the sharing platform is called **Autosidia**.

Intended capabilities:

- **Import / export** of preset files from the plugin — JSON in v1.0 ([presetIO.ts](src/presets/presetIO.ts)); share/browse when the service exists.
- **Share** to submit a preset to the Autosidia registry (subject to moderation — future).
- **Browse** a catalog (future).

The plugin ships with **health check only** against `settings.autosidia.registryBaseUrl` + `/health` ([API.md](API.md#network-optional)). Full registry API, URL, and auth: future [API.md](API.md) updates.

## Related documents

- [PLANS.md](PLANS.md) — Phased product roadmap and long-term horizon (companion to [TODO.md](TODO.md)).
- [README.md](README.md) — Short overview and links.
- [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture.
- [UI.md](UI.md) — All UI and setting descriptions.
- [API.md](API.md) — APIs and external integration.
- [CONTRIBUTING.md](CONTRIBUTING.md) — Development workflow.
- [SECURITY.md](SECURITY.md) — Security reporting (including the Autosidia service when live).

## Document index (duplicated from README for SPEC readers)

| File | Role |
|------|------|
| README.md | Overview |
| SPEC.md | This specification |
| ARCHITECTURE.md | Codebase architecture |
| UI.md | User interface spec |
| API.md | Integration API |
| AGENTS.md | AI agent rules |
| LICENSE.txt | License |
| CODE_OF_CONDUCT.md | Code of conduct |
| TODO.md | Tasks |
| CHANGELOG.md | Release notes |
| CONTRIBUTING.md | Contribution guide |
| PLANS.md | Long-term product phases and roadmap |
| SUPPORT.md | Support channels |
| SECURITY.md | Vulnerability reporting |
