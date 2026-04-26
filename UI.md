# User interface

This document describes the **Obsidian** user experience for the **Autosidian** plugin: settings, affordances, and per-feature behavior. The sharing web app **Autosidia** is specified in [SPEC.md](SPEC.md#autosidia-community-registry).

## Autosidian settings tab (v1.0+)

- **Header** — Short product description; required community plugins should be installed and **enabled** for automation to be meaningful.
- **Dependency notice** — If any required plugin is not enabled, lists human-readable names and manifest IDs. If all are enabled, a brief confirmation line.
- **Sections** — Auto–Folder Notes, Auto–Waypoint, Auto–Iconize (including in-app **keyword → icon** table), Auto–Pixel Banner, **Auto–Cover** (web image search → built-in `cover` property), **Background retro queues** (stop all), then **Presets & Autosidia** (JSON copy/import, registry URL, health ping). See headings below in this file.
- **Version** (read-only) — `settingsVersion` (4 after migration).

## Settings structure (convention)

Settings are grouped by integrated plugin: **Folder Notes** (first), **Waypoint**, **Iconize** (UI may say “Auto-Iconize” but the target is **Iconize**), **Pixel Banner**, then **Auto–Cover** (Obsidian's built-in `cover` property — no community plugin). Where applicable: **new** / **retroactive** behavior and **rate limits** for background work.

## Auto–Folder Notes

Automates and extends [Folder Notes](https://github.com/LostPaul/obsidian-folder-notes) using the usual layout **`FolderName/FolderName.md`**.

### Settings and behavior (implemented)

- **New folders** — When on, on every new `TFolder` (except vault root), if `Name/Name.md` does not exist, it is created (empty). Skipped for paths in the internal reentry set while converting a note.
- **New notes → folder with folder note** — When on, on `vault` `create` for a new `.md` `TFile` that is **not** already a folder note (`file.basename === parent folder name` with non-root `TFolder` parent), the note is turned into a folder of the same name with that file moved to `Name/Name.md` (content preserved).
- **Retroactive (missing folder notes)** — When toggled on, fills a queue of non-root folders that have no `Name/Name.md` and processes up to *Retro max per minute* (slider 1–120). Toggling on shows a **Notice** with queue size (or that none are missing). When the queue empties, the internal timer stops until you toggle off/on or run again after reload. Changing the rate restarts the timer with a new interval.
- **Command** — *Convert active note to folder with folder note* (command palette) — only when the active file is a `.md` that is not already a folder-note file.
- **File menu** — On a non–folder-note `.md` file, **Convert to folder with folder note** (section `autosidian`).
- **Context menu (folder)** — (Future / optional; file menu covers the same for files.)

**Folder note detection:** a markdown file is a folder note when its parent is a non-root folder and the note’s base name (without extension) equals the parent folder’s name.

## Auto–Waypoint

Extends [Waypoint](https://github.com/IdreesInc/Waypoint). Inserts the short `%% Waypoint %%` after YAML front matter when needed ([waypointMarkdown.ts](src/waypoint/waypointMarkdown.ts)).

### Settings (in-app)

- **New folder notes** — On `create` of a folder-note `.md` whose parent has **at least one subfolder**, insert if the body has neither the short token nor `%% Begin Waypoint %%`.
- **When a subfolder is created** — After `create` of a new `TFolder` under a parent, patch the **parent’s** folder note if a waypoint is now required.
- **Retro** + **/ minute** — One vault `modify` per tick for queued folder notes. When the settings tab is open, a line shows the **approximate waypoint queue length** (reopen to refresh). **Stop all background retro queues** (below) clears this queue without toggling retro off.
- **Command** — *Add %% Waypoint %% to active folder note (if needed)*. **File menu** on `.md` (section `autosidian`).

## Auto–Iconize

> ⚠️ **Experimental and incomplete.** May mis-match emojis, fail to sync with Iconize, or leave folder rows without icons. Review results before trusting on a large vault; keep backups.

Targets [Iconize](https://florianwoelki.github.io/obsidian-iconize/) by writing the **`icon` property in YAML / Properties** on the **folder note** (`Folder/Folder.md`). **Longest** keyword match on the **folder name** wins, then (if **Match most similar emoji** is on) a best match from the [emojilib](https://github.com/muan/emojilib) English keyword set plus a built-in **synonym** list, then an optional **default** icon, then (if default is empty) a **diverse** stable emoji per name when that option is on.

**Iconize’s** own settings: turn on the option that **reads icons from front matter / note properties** ([Use Frontmatter](https://florianwoelki.github.io/obsidian-iconize/files-and-folders/use-frontmatter.html) — the internal flag is `iconInFrontmatterEnabled`). The **field name in Iconize** must **match** Autosidian’s **Icon front matter field** (both default to `icon`). *Set icon* from the context menu usually writes Iconize’s `data` only, unless you enable Iconize’s **write / sync** option for front matter; Autosidian always writes the note. Use Iconize’s **Refresh icons from front matter** (v2.14+) if metadata changed while the plugin was off.

**Why the tree might show no icon on the folder row:** Iconize registers the front-matter value under the **.md** file path first. Autosidian can also call Iconize’s API so the same icon is stored under the **folder** path (setting **Show icon on folder row**). If you only see the icon on the `FolderName.md` line, turn that on and reload if needed.

### Settings (in-app)

- **Enable** / **Skip** / **Field name** / **Default icon** / **Match most similar emoji (emojilib + synonyms)** / **Diverse emoji for unmatched names** (hash-based when default is empty) / **Show icon on folder row** / **New or renamed folders** / **Retro** + rate.
- **Keyword → icon rules** — Editable table; **JSON** in **Presets & Autosidia** for bulk or backup.

### Command

- *Apply keyword icon to selected folder (folder note)* when the **active** file is a folder note.

### File explorer (folder note)

- **Right-click** the folder note file (`Folder/Folder.md`) → **Autosidian: Auto-iconize best-matching emoji (from folder name)** — writes the best emojilib match for the **parent folder’s name** to the `icon` field (same rules as “most similar”; ignores your keyword table and default for this one action). Requires **Enable Auto–Iconize**; respects **Skip if icon already set**.

### Settings — lookup tables

Under **Auto–Iconize**, after the keyword table: **Emoji & keyword lookup (built-in + your keywords)** shows synonym samples, a **search** box, and a scrollable table of **all ~1,870** bundled emojis. Each row has three columns:

1. **Emoji**.
2. **Built-in keywords** (sample from [emojilib](https://github.com/muan/emojilib); read-only).
3. **Your keywords** — free-text input, **comma-** or **space-separated** (e.g. `robot, ai, ml`). Saved to `iconize.customEmojiKeywords[<emoji>]` on change. Empty input removes the entry.

Custom keywords feed the resolver in **two** ways:

- **Always:** they act as additional **longest-match** keyword → icon rules alongside the **Keyword → icon rules** table (the rules table still wins on equal-length ties so you can keep manual overrides).
- **When *Match most similar emoji* is on:** matching tokens give the chosen emoji a strong score boost in the emojilib lookup, biasing it toward your preference without replacing the index.

The custom map is included in **Copy / Import JSON** (Presets & Autosidia) so you can share or back up your tweaks.

### If icons never appear on existing folders

- **Retro** must be on for **already-created** folder notes; **New / renamed folders** only runs on new/renamed folders.
- If **default icon** is empty, **Match most similar** is off, **Diverse emoji** is off, and the name matches no keyword in your table, nothing is written — turn **Match most similar** and/or **Diverse** on or set a default icon, then re-save a setting to refresh the retro queue.
- **Iconize** must have **front matter / properties** reading enabled and a **text**-typed `icon` (or your custom field) in Obsidian; wrong property types can block Iconize.
- If **skip if icon already set** is on and a note has an empty or dummy `icon`, use *Apply keyword icon* or turn skip off for one pass.

## Auto–Pixel Banner

[Pixel Banner](https://github.com/jparkerweb/pixel-banner) — sets **`banner`** to **search keywords** (note title by default) so Pixel Banner’s **Pexels / 3rd-party** API can fetch images; use **Enable Pixel Banner API search (Pexels)…** to configure the Pixel Banner plugin. Align the field name with Pixel Banner’s *Custom Fields* if you change it. [eQuillabs — Pixel Banner](https://www.equillabs.com/projects/pixel-banner/).

### Settings (in-app)

- **Enable Autosidian Pixel Banner automation** / **Banner field** / **one-click Pexels preset** / **new notes: set to note title** / **ignore title** (fallback keyword) / **Candidate count (1–5)** for the picker / **Retro** + rate. Missing `banner` on notes: [listMissingBanner.ts](src/pixelBanner/listMissingBanner.ts) via [metadataCache](https://docs.obsidian.md).

### Command

- *Pick banner from keyword candidates (Pixel Banner / Pexels) — current note* — modal; [processFrontMatter](https://docs.obsidian.md).

## Auto–Cover

Alternative to **Auto–Pixel Banner** that uses Obsidian's **built-in `cover` property** — no community plugin required. Auto–Cover actually performs an **image search** for each note (one HTTP call per note) and writes the resulting URL into front matter, where it is picked up by **Bases** card view (Image property) and **Obsidian Publish** social previews.

### Providers

- **Auto** (default) — Try **Wikipedia** REST page summary first (lead image for the topic, no API key); fall back to **Openverse** (free CC search, no key); finally **Pexels** if an API key is configured.
- **Wikipedia** — Lead image only; great for notes whose title matches a Wikipedia topic, blank otherwise.
- **Openverse** — Free, keyless CC image search; broader coverage but lower curation.
- **Pexels** — Requires an API key in the field below; results are served via direct HTTPS.

### Settings (in-app)

- **Enable Auto–Cover** / **Cover front matter field** (default `cover`) / **Image search provider** / **Pexels API key** (optional) / **New notes: search and set `cover` automatically** / **Skip if `banner` already set** (recommended when running both features) / **Ignore note title** / **Candidate count (1–5)** for the picker / **Retro** + **/ minute** (1–120, default **6** to be friendly to free APIs).

### Command

- *Pick cover image from keyword candidates (Auto–Cover) — current note* — modal lists keyword variants; on selection, runs the image search and writes the chosen URL via [processFrontMatter](https://docs.obsidian.md). On no-results, shows a Notice so you can pick a different keyword.

### Interaction with Auto–Pixel Banner

The two features are independent and may be enabled together. With **Skip if `banner` already set** on (default), Auto–Cover skips notes that already have a Pixel Banner value, so each note ends up with at most one of the two. Field names are independent: change them under their respective sections to remove any overlap.

## Hierarchical folder styling (planned)

> Not yet implemented — see [PLANS.md](PLANS.md#phase-7--hierarchical-folder-styling-planned).

Will apply **per-depth visual styling** to hierarchical folders so each level of the tree is recognizable across [graph view](https://help.obsidian.md/Plugins/Graph+view), the **file explorer**, and folder-note banners. Root / top-level folders render as **bigger graph nodes** and stronger labels; deeper folders shrink and de-emphasize.

### Planned settings

- **Enable Hierarchical folder styling** — master toggle.
- **Max styled depth** — depth beyond which the deepest tier’s style is reused (e.g. 4).
- **Per-depth styles** — table keyed by depth (1 = root). Per row: node size (graph view), font size / weight (explorer + graph label), color, icon scale (composes with [Auto–Iconize](#autoiconize)).
- **Surfaces** — independent toggles for **Graph view**, **File explorer**, and **Folder-note banner** (composes with [Auto–Pixel Banner](#autopixel-banner) / [Auto–Cover](#autocover)).
- **Retro** + **/ minute** — recompute depth class for all folders when settings change.

### Planned commands

- *Recompute hierarchical styles for all folders* — full re-pass without toggling retro.
- *Reset hierarchical styles* — clears any depth metadata and removes injected CSS.

## Background retro queues (section)

- **Stop all** — Clears the in-memory wait queues for **folder notes, waypoint, iconize, pixel, and cover** retro (does not change toggles; queues can refill on next notice). **Command palette** — the same *Stop all background retro queues* command.

## Presets & Autosidia (section)

- **Copy** / **Import** full settings JSON — [presetIO](src/presets/presetIO.ts).
- **Registry URL** + **Ping** — [AutosidiaClient](src/autosidia/AutosidiaClient.ts) `GET /health` (optional, future server).

## Accessibility and safety

- Retro queues and rate limits; [safePath](src/safePath.ts) skips **`.obsidian`**. **Network** (Pexels via Pixel Banner, Wikipedia / Openverse / Pexels via Auto–Cover, Autosidia): [SECURITY.md](SECURITY.md).
