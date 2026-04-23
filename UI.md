# User interface

This document describes the **Obsidian** user experience for the **Autosidian** plugin: settings, affordances, and per-feature behavior. The sharing web app **Autosidia** is specified in [SPEC.md](SPEC.md#autosidia-community-registry).

## Autosidian settings tab (v1.0+)

- **Header** — Short product description; required community plugins should be installed and **enabled** for automation to be meaningful.
- **Dependency notice** — If any required plugin is not enabled, lists human-readable names and manifest IDs. If all are enabled, a brief confirmation line.
- **Sections** — Auto–Folder Notes, Auto–Waypoint, Auto–Iconize (including in-app **keyword → icon** table), Auto–Pixel Banner, **Background retro queues** (stop all), then **Presets & Autosidia** (JSON copy/import, registry URL, health ping). See headings below in this file.
- **Version** (read-only) — `settingsVersion` (3 after migration).

## Settings structure (convention)

Settings are grouped by integrated plugin: **Folder Notes** (first), **Waypoint**, **Iconize** (UI may say “Auto-Iconize” but the target is **Iconize**), **Pixel Banner**. Where applicable: **new** / **retroactive** behavior and **rate limits** for background work.

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

Under **Auto–Iconize**, after the keyword table: **Emoji & keyword lookup** shows synonym samples, a **search** box over the bundled emojilib keywords, and a scrollable **emoji ↔ keywords** preview.

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

## Background retro queues (section)

- **Stop all** — Clears the in-memory wait queues for **folder notes, waypoint, iconize, and pixel** retro (does not change toggles; queues can refill on next notice). **Command palette** — the same *Stop all background retro queues* command.

## Presets & Autosidia (section)

- **Copy** / **Import** full settings JSON — [presetIO](src/presets/presetIO.ts).
- **Registry URL** + **Ping** — [AutosidiaClient](src/autosidia/AutosidiaClient.ts) `GET /health` (optional, future server).

## Accessibility and safety

- Retro queues and rate limits; [safePath](src/safePath.ts) skips **`.obsidian`**. **Network** (Pexels via Pixel Banner, Autosidia): [SECURITY.md](SECURITY.md).
