# User interface

This document describes the **Obsidian** user experience for the **Autosidian** plugin: settings, affordances, and per-feature behavior. The sharing web app **Autosidia** is specified in [SPEC.md](SPEC.md#autosidia-community-registry).

## Autosidian settings tab (v1.0+)

- **Header** — Short product description; required community plugins should be installed and **enabled** for automation to be meaningful.
- **Dependency notice** — If any required plugin is not enabled, lists human-readable names and manifest IDs. If all are enabled, a brief confirmation line.
- **Sections** — Auto–Folder Notes, then Auto–Waypoint, Auto–Iconize, Auto–Pixel Banner, then **Presets & Autosidia** (JSON copy/import, registry URL, health ping). See headings below in this file.
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
- **Retro** + **/ minute** — One vault `modify` per tick for queued folder notes.
- **Command** — *Add %% Waypoint %% to active folder note (if needed)*. **File menu** on `.md` (section `autosidian`).

## Auto–Iconize

Targets [Iconize](https://florianwoelki.github.io/obsidian-iconize/) by writing front matter (default field **`icon`**) on the **folder note**; **longest** keyword match on the **folder name** wins. Enable Iconize’s use of **front matter / note properties** in **Iconize’s** own settings.

### Settings (in-app)

- **Enable** / **Skip if icon present** / **Field name** / **New or renamed folders** / **Retro** + rate.
- **Rules** — Ten built-in keyword→icons in [settings.ts](src/settings.ts); **JSON** (Copy/Import) to bulk-edit in **Presets & Autosidia**.

### Command

- *Apply keyword icon to selected folder (folder note)* when the **active** file is a folder note.

## Auto–Pixel Banner

[Pixel Banner](https://github.com/jparkerweb/pixel-banner) — sets **`banner`** to an **HTTPS** URL ([Picsum](https://picsum.photos) in v1.0, [picsum.ts](src/pixelBanner/picsum.ts)). Align the field name with Pixel Banner’s *custom field* settings if you change it. [eQuillabs — Pixel Banner](https://www.equillabs.com/projects/pixel-banner/).

### Settings (in-app)

- **Enable** / **Banner field** / **New notes: set URL** / **Ignore title** / **Candidate count (1–5)** for the picker / **Retro** + rate. Missing notes found via [metadataCache](https://docs.obsidian.md) ([listMissingBanner.ts](src/pixelBanner/listMissingBanner.ts)).

### Command

- *Pick banner from image candidates (Picsum) — current note* — modal; choose a URL, then [processFrontMatter](https://docs.obsidian.md).

## Presets & Autosidia (section)

- **Copy** / **Import** full settings JSON — [presetIO](src/presets/presetIO.ts).
- **Registry URL** + **Ping** — [AutosidiaClient](src/autosidia/AutosidiaClient.ts) `GET /health` (optional, future server).

## Accessibility and safety

- Retro queues and rate limits; [safePath](src/safePath.ts) skips **`.obsidian`**. **Network** (Picsum, Autosidia): [SECURITY.md](SECURITY.md).
