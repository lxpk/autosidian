# Autosidian

**Autosidian** is an Obsidian community plugin that automates workflows around other community plugins, so you spend less time on repetitive setup (folder notes, waypoints, folder icons, and pixel banners) and more time writing.

**Target users:** Vaults that rely on [Folder Notes](https://github.com/LostPaul/obsidian-folder-notes), [Waypoint](https://github.com/IdreesInc/Waypoint), [Iconize](https://florianwoelki.github.io/obsidian-iconize/), and [Pixel Banner](https://github.com/jparkerweb/pixel-banner) and want those tools kept in sync as the vault grows.

**License:** [Apache 2.0](LICENSE.txt) — SPDX: `Apache-2.0` (see appendix in file for copyright line).

## CI & GitHub Releases

Pushes to **`main`** (or **`master`**) run [GitHub Actions](.github/workflows/ci.yml): **tests**, then a **release** step that publishes a [GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) with `main.js`, `manifest.json`, and `styles.css` when the **manifest version is new** (no existing git tag with that name). Bump **`manifest.json`**, **`package.json`**, and **`versions.json`** together for each public version (see [CONTRIBUTING.md](CONTRIBUTING.md#automated-github-releases-brat--manual-install--updater)). That layout is what **BRAT**, manual installs from GitHub, and Obsidian’s **community plugin updater** expect once the plugin is listed.

## Requirements

Install and enable the following **community plugins** (Autosidian does not replace them; it automates and extends how you use them):

- [Folder Notes](https://github.com/LostPaul/obsidian-folder-notes)
- [Waypoint](https://github.com/IdreesInc/Waypoint)
- [Iconize](https://florianwoelki.github.io/obsidian-iconize/) (the features below refer to this plugin; “Auto-Iconize” in settings is automation *for* Iconize.)
- [Pixel Banner](https://github.com/jparkerweb/pixel-banner) (see also [eQuillabs — Pixel Banner](https://www.equilllabs.com/projects/pixel-banner/))

**Minimum Obsidian:** `1.6.0` (see `manifest.json` `minAppVersion`; aligns with Pixel Banner’s floor). For build steps and full detail, see [SPEC.md](SPEC.md).

## Installation

- **From Obsidian (when published):** Community plugins → search **Autosidian** → Install → Enable.
- **From source (development):** [SPEC.md](SPEC.md#from-source-development) and [CONTRIBUTING.md](CONTRIBUTING.md).

### Development (quick)

```bash
npm install
npm test        # vitest + tsc + esbuild (AGENTS: run before commit)
npm run dev     # esbuild watch — reload plugin in Obsidian after each save
```

Copy `manifest.json`, `main.js`, and `styles.css` into the vault’s `.obsidian/plugins/autosidian/` (create the folder; see Obsidian’s plugin dev docs for symlink workflows). For **E2E / integration** (default iCloud `autosidian` on macOS when that folder exists), see [e2e/README.md](e2e/README.md#which-vault-to-use-when-testing-in-the-app) and [AGENTS.md](AGENTS.md#standard-test-checklist).

## Features (overview)

| Area | What it does |
|------|----------------|
| **Auto–Folder Notes** | Ensures new folders get folder notes, can convert single notes into folder+folder note, optional retroactive pass. |
| **Auto–Waypoint** | Injects `%% Waypoint %%` when a folder note has subfolders and no waypoint; new-note + subfolder create + optional retro, rate-limited. |
| **Auto–Iconize** | Longest-keyword match; writes `icon` front matter on folder notes (import/export keyword JSON in settings). |
| **Auto–Pixel Banner** | Picsum image URLs, optional modal picker, new-note and retro; align `banner` field name with your Pixel Banner config. |
| **Hierarchical folder styling** *(planned)* | Per-depth aesthetic tweaks for hierarchical folders — e.g. larger graph nodes for root folders, scaled icons, color/weight per level. |

Detailed settings labels, behavior, and UX live in [UI.md](UI.md). **Autosidia** (see below) is the separate registry for sharing keyword presets and other configs.

## Autosidia (community sharing)

**Autosidia** is the name of the community presets and config-sharing web app and registry (not the Obsidian plugin). It lets you import, export, and share presets for Autosidian and other tools. For scope and flow, see [SPEC.md](SPEC.md#autosidia-community-registry).

## Support, security, contributing

- **Help and questions:** [SUPPORT.md](SUPPORT.md)
- **Report vulnerabilities:** [SECURITY.md](SECURITY.md)
- **Contribute code or docs:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Community norms:** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Document tree

| Document | Purpose |
|----------|--------|
| [README.md](README.md) | This file — quick start, overview, links. |
| [SPEC.md](SPEC.md) | Full product and technical specification (install, behavior, Autosidia). |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Plugin structure, dependencies, and data flow. |
| [UI.md](UI.md) | User interface: settings, commands, and per-feature behavior. |
| [API.md](API.md) | Surfaces for integration (Obsidian APIs, web/registry, external services). |
| [AGENTS.md](AGENTS.md) | Guidance for AI coding agents working in this repo. |
| [PLANS.md](PLANS.md) | Long-term phases and strategy (vs [TODO](TODO.md) near-term). |
| [LICENSE.txt](LICENSE.txt) | Apache 2.0 full text. |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Community expectations. |
| [TODO.md](TODO.md) | Task checklist. |
| [CHANGELOG.md](CHANGELOG.md) | Version history. |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute. |
| [SUPPORT.md](SUPPORT.md) | Where to get support. |
| [SECURITY.md](SECURITY.md) | Security disclosure. |
