# API and integration

Surfaces for **Autosidian** (Obsidian plugin) and, when implemented, the **Autosidia** registry. For behavior from the user’s perspective, see [UI.md](UI.md).

## Obsidian

- **Plugin API** — Standard Obsidian `Plugin` lifecycle: `onload` / `onunload`, `addSettingTab`, `registerEvent` for `vault`/`workspace` events, and commands where appropriate. Exact command IDs TBD.
- **Manifest** — `manifest.json` exposes `id`, `name`, `version`, and `minAppVersion`; must stay aligned with [SPEC.md](SPEC.md#prerequisites-and-dependencies).

## Partner plugins

Integration is with **public** behavior of these plugins, not private internals:

- [Folder Notes](https://github.com/LostPaul/obsidian-folder-notes) — File naming and layout conventions for folder notes.
- [Waypoint](https://github.com/IdreesInc/Waypoint) — `%% Waypoint %%` and expanded waypoint blocks.
- [Iconize](https://florianwoelki.github.io/obsidian-iconize/) — Icon assignment to paths or files as documented by the plugin.
- [Pixel Banner](https://github.com/jparkerweb/pixel-banner) — Front matter or settings fields the plugin reads for banner images.

If a future major version of a partner plugin changes its contract, Autosidian should version-gate or adapt (documented in CHANGELOG).

## Network (optional features)

- **Image search or image APIs** for Auto–Pixel Banner: provider TBD. Must use HTTPS where applicable, respect **rate limits** and **API keys** via Obsidian’s secure storage if keys are required.
- **Autosidia HTTP API** — For preset upload, list, and download. Versioned REST or GraphQL to be defined; include authentication model if accounts exist. **Not live until the service is deployed** — this document will be updated with base URL, `Authorization` shape, and error codes.

## File formats (presets)

- **Keyword sets** and **settings exports** are expected to be **JSON** with a `version` field for forward compatibility. Schema details will live in code (`schemas/` or types) when the project exists.

## Security reference

- Transport: TLS for all Autosidia calls. For vulnerability reporting, see [SECURITY.md](SECURITY.md).
