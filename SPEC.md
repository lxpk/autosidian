# Specification

This document is the project specification: installation, dependencies, how Autosidian is intended to behave, and the **Autosidia** community registry. For UI detail see [UI.md](UI.md); for code layout see [ARCHITECTURE.md](ARCHITECTURE.md).

## Installation

### From Community Plugins (recommended, when published)

1. In Obsidian: **Settings → Community plugins** — turn off Restricted mode if needed.
2. **Browse** → search for **Autosidian** → **Install** → **Enable**.

### From source (development)

1. Clone this repository and install dependencies (see [CONTRIBUTING.md](CONTRIBUTING.md) for the exact commands used in this project — typically `npm install` in the plugin root for an Obsidian TypeScript project).
2. Build with the project’s build script (commonly `npm run build`); for iteration, `npm run dev` may be available for a watch build.
3. Link or copy the build output into your vault’s `.obsidian/plugins/autosidian/` path per [Obsidian’s plugin dev docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin).

The repository may not yet include application code; when it does, CONTRIBUTING will list the authoritative scripts.

## Prerequisites and dependencies

- **Obsidian:** Minimum app/API version TBD; should be set to match the `manifest.json` `minAppVersion` once the plugin is implemented.
- **Required community plugins (always):**
  - [Folder Notes](https://github.com/LostPaul/obsidian-folder-notes) — for folder-note and folder click behavior.
  - [Waypoint](https://github.com/IdreesInc/Waypoint) — for `%% Waypoint %%` / `%% Begin Waypoint %%` behavior.
  - [Iconize](https://florianwoelki.github.io/obsidian-iconize/) — for folder icons.
  - [Pixel Banner](https://github.com/jparkerweb/pixel-banner) — for page banners; related product context: [eQuillabs](https://www.equilllabs.com/projects/pixel-banner/).

Autosidian should detect missing plugins and surface a clear notice in settings (exact copy TBD in implementation).

## Functional summary

- **Auto–Folder Notes:** On folder creation, new non-folder notes, and optional vault-wide retroactive pass, create or align folder notes with Folder Notes conventions. Context menu: turn a note into a folder whose folder note is that file.
- **Auto–Waypoint:** On new folder notes and optional retroactive pass, insert `%% Waypoint %%` where missing when the folder has child folders and the note does not already contain Waypoint’s expanded block (`%% Begin Waypoint %%` …). Per-minute rate limit for retroactive runs.
- **Auto–Iconize:** For folders without an icon, choose emoji from keyword rules (editable lists, defaults from curated keyword→emoji mappings). Optional new/rename and retroactive passes with a per-minute cap.
- **Auto–Pixel Banner:** UI to search for banner images and attach candidates; optional automatic and retroactive assignment with a per-minute cap.

Details: [UI.md](UI.md). Integration points: [API.md](API.md). Structure: [ARCHITECTURE.md](ARCHITECTURE.md).

## Autosidia (community registry)

**Autosidia** is the name of the web app and registry for **sharing presets and configs** (keyword→icon sets, Autosidian settings bundles, and potentially presets useful to other plugins). The Obsidian plugin remains **Autosidian**; only the sharing platform is called **Autosidia**.

Intended capabilities:

- **Import / export** of preset files from the plugin settings (formats TBD, likely JSON).
- **Share** to submit a preset to the Autosidia registry (subject to moderation/spam policy TBD).
- **Browse** (optional) a catalog of public presets and apply or fork them.

URL, hosting, auth, and API version will be documented in [API.md](API.md) when the service exists. Until then, treat this section as a product outline.

## Related documents

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
| SUPPORT.md | Support channels |
| SECURITY.md | Vulnerability reporting |
