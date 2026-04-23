# API and integration

Surfaces for **Autosidian** (Obsidian plugin) and, when implemented, the **Autosidia** registry. For behavior from the user’s perspective, see [UI.md](UI.md).

## Obsidian

- **Plugin API** — Standard Obsidian `Plugin` lifecycle: `onload` / `onunload`, `addSettingTab`, `registerEvent` for `vault` / `workspace` events, and `addCommand` where appropriate.
- **Commands (v1.0+)** —

| id | User-visible name | Notes |
|----|-------------------|--------|
| `autosidian-convert-note-to-folder` | Convert active note to folder with folder note | Active file must be eligible `.md`. |
| `autosidian-add-waypoint` | Add %% Waypoint %% to active folder note (if needed) | Active file. |
| `autosidian-apply-icon-selection` | Apply keyword icon to selected folder (folder note) | Active file must be a folder note. |
| `autosidian-pick-banner-candidates` | Pick banner from keyword candidates (Pixel Banner / Pexels) — current note | Modal; writes keyword to `banner`. |
| `autosidian-stop-all-retro-queues` | Stop all background retro queues (folder, waypoint, iconize, pixel) | Clears pending queue items; does not change retro toggles. |

- **Manifest** — [manifest.json](manifest.json) exposes `id`, `name`, `version`, and `minAppVersion`; must stay aligned with [SPEC.md](SPEC.md#prerequisites-and-dependencies).
- **Front matter** — [FileManager](https://docs.obsidian.md) `processFrontMatter` for `icon` (Iconize) and `banner` (Pixel Banner) fields (names configurable in settings).

## Community plugin manifest IDs

When checking whether a dependency is **enabled**, use the exact `id` from each plugin’s `manifest.json`:

| Plugin     | `id`                  |
|------------|------------------------|
| Folder Notes | `folder-notes`       |
| Waypoint   | `waypoint`            |
| Iconize    | `obsidian-icon-folder` |
| Pixel Banner | `pexels-banner`     |

`app.plugins` is not declared on the public `App` type; [requiredPlugins](src/deps/requiredPlugins.ts) uses a narrow runtime cast to read `enabledPlugins`.

## Partner plugins

Integration is with **public** behavior of these plugins, not private Iconize/Pixel internal classes:

- [Folder Notes](https://github.com/LostPaul/obsidian-folder-notes) — `Name/Name.md` layout.
- [Waypoint](https://github.com/IdreesInc/Waypoint) — `%% Waypoint %%` / `%% Begin Waypoint %%`.
- [Iconize](https://florianwoelki.github.io/obsidian-iconize/) — We set the **`icon` front matter** on **folder notes** (table rules, optional **emojilib**-based most-similar match when enabled, **`defaultIcon`**, **diverse** hash). **File menu** on a folder note: best-matching emoji from folder name ([`applyBestMatchingEmojiToFolder`](src/iconize/applyIconFrontmatter.ts)). Optional `addFolderIcon` on the **folder** path ([`syncIconizeFolderExplorerPath.ts`](src/iconize/syncIconizeFolderExplorerPath.ts), [`emojiSimilarity.ts`](src/iconize/emojiSimilarity.ts)). [Use Frontmatter / properties in Iconize](https://florianwoelki.github.io/obsidian-iconize/files-and-folders/use-frontmatter.html); field name matches Autosidian’s **Icon front matter field**.
- [Pixel Banner](https://github.com/jparkerweb/pixel-banner) — We set **`banner`** to **search keywords** (note title) or similar so Pixel Banner’s API layer can resolve images; or custom field names. See [keywordsForBanner.ts](src/pixelBanner/keywordsForBanner.ts).

## Network (optional)

- **Pexels (via Pixel Banner)** — Configure keys in the Pixel Banner plugin; Autosidian can one-click a Pexels preset. Apply your own [SECURITY.md](SECURITY.md) and vault policy.
- **Autosidia** — [AutosidiaClient](src/autosidia/AutosidiaClient.ts) `GET {base}/health` when you configure `registryBaseUrl` and use **Test** in settings.
- **Future** — Image providers with API keys: use Obsidian [Secret storage](https://docs.obsidian.md) when implemented.

## Presets (JSON)

- [presetIO.ts](src/presets/presetIO.ts) — `exportSettingsToJson`, `importPresetJson`, `mergeImportedIntoSettings`. Schema wrapper `{ "schema": "autosidian-preset", "version": 1, "data": { ... } }` or a raw partial of [AutosidianSettings](src/settings.ts).

## Security reference

- TLS for public HTTPS to Pexels (via Pixel Banner) and to Autosidia when deployed. For vulnerability reporting, see [SECURITY.md](SECURITY.md).
