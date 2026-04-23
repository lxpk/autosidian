# Autosidian

**Autosidian** is an Obsidian community plugin that automates workflows around other community plugins, so you spend less time on repetitive setup (folder notes, waypoints, folder icons, and pixel banners) and more time writing.

**Target users:** Vaults that rely on [Folder Notes](https://github.com/LostPaul/obsidian-folder-notes), [Waypoint](https://github.com/IdreesInc/Waypoint), [Iconize](https://florianwoelki.github.io/obsidian-iconize/), and [Pixel Banner](https://github.com/jparkerweb/pixel-banner) and want those tools kept in sync as the vault grows.

**License:** See [LICENSE.txt](LICENSE.txt).

## Requirements

Install and enable the following **community plugins** (Autosidian does not replace them; it automates and extends how you use them):

- [Folder Notes](https://github.com/LostPaul/obsidian-folder-notes)
- [Waypoint](https://github.com/IdreesInc/Waypoint)
- [Iconize](https://florianwoelki.github.io/obsidian-iconize/) (the features below refer to this plugin; “Auto-Iconize” in settings is automation *for* Iconize.)
- [Pixel Banner](https://github.com/jparkerweb/pixel-banner) (see also [eQuillabs — Pixel Banner](https://www.equilllabs.com/projects/pixel-banner/))

For minimum Obsidian versions, build steps, and full behavioral detail, see [SPEC.md](SPEC.md).

## Installation

- **From Obsidian (when published):** Community plugins → search **Autosidian** → Install → Enable.
- **From source (development):** See [SPEC.md](SPEC.md#installation) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Features (overview)

| Area | What it does |
|------|----------------|
| **Auto–Folder Notes** | Ensures new folders get folder notes, can convert single notes into folder+folder note, optional retroactive pass. |
| **Auto–Waypoint** | Injects `%% Waypoint %%` into folder notes that need a waypoint, with new-note and retroactive options and rate limits. |
| **Auto–Iconize** | Suggests or applies emoji for folders from keyword rulesets; import/export of keyword lists. |
| **Auto–Pixel Banner** | Helps find and attach banner images (manual search UI and optional automatic/retroactive modes with rate limits). |

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
| [LICENSE.txt](LICENSE.txt) | License terms. |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Community expectations. |
| [TODO.md](TODO.md) | Task checklist. |
| [CHANGELOG.md](CHANGELOG.md) | Version history. |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute. |
| [SUPPORT.md](SUPPORT.md) | Where to get support. |
| [SECURITY.md](SECURITY.md) | Security disclosure. |
