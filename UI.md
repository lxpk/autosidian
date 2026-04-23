# User interface

This document describes the **Obsidian** user experience for the **Autosidian** plugin: settings, affordances, and per-feature behavior. The sharing web app **Autosidia** is specified in [SPEC.md](SPEC.md#autosidia-community-registry).

## Settings structure (convention)

Settings are grouped by integrated plugin: **Folder Notes**, **Waypoint**, **Iconize** (automation in Autosidian may be labeled “Auto-Iconize” in the UI, but it drives the **Iconize** plugin), and **Pixel Banner**. Each group includes toggles for **new** and **retroactive** behavior where applicable, plus **rate limits** for background scans to avoid vault-wide freezes.

## Auto–Folder Notes

Automates and extends [Folder Notes](https://github.com/LostPaul/obsidian-folder-notes).

### Settings and behavior

- **Auto–Folder Notes: New Folders** — When on, new folders get a folder note automatically.
- **Auto–Folder Notes: New Notes** — When the user creates a new note that is *not* a folder, the plugin can convert the workflow so it becomes a folder with that note as its folder note (per product rules in implementation).
- **Auto–Folder Notes: Retroactive** — When on, run a process that creates folder notes for folders that are missing one. Folder notes are notes whose name matches the parent folder, matching Folder Notes’ model (click the folder to open the note; platform-specific modifier for alternate actions, per Folder Notes).
- **Context menu** — Action on a selected note: **convert to folder** with the current file as the folder’s folder note (wording in-app may vary).

## Auto–Waypoint

Extends [Waypoint](https://github.com/IdreesInc/Waypoint).

- **Button on folder notes** — If a folder note lacks a waypoint where one is needed, show a control to add it (exact placement: inline with the note or in a ribbon/command — implementation detail).
- **Auto–Waypoints: New** — Add a waypoint to all new folder notes that should have one.
- **Auto–Waypoints: Retroactive** — Add waypoints to existing folder notes that should have one but do not.
- **Auto–Waypoints: Retroactive rate limit** — Maximum number of waypoints to add per minute during retroactive passes (reduces I/O and UI churn).

### Waypoint text rules

- Insert `%% Waypoint %%` in folder notes that have **child folders** and that **do not** already contain a Waypoint **expanded** section beginning with `%% Begin Waypoint %%` (the Waypoint plugin replaces the short token with the expanded block). If that expanded section is already present, do not duplicate.

## Auto–Iconize (Iconize automation)

Automates [Iconize](https://florianwoelki.github.io/obsidian-iconize/) by assigning an emoji to folders that have no icon yet, using **keywords** in the folder title (or note title, per implementation).

### Settings and behavior

- **Auto-Icon: Button** — Apply an icon to the **currently selected** item (folder or as supported).
- **Auto-Icon: New** — When on, add emoji icons to newly created or **renamed** folders that do not already have an icon.
- **Auto-Icon: Retroactive** — When on, background scan of folders that still lack an icon; apply gradually.
- **Auto-Icon: Scan rate limit** — Max icons to assign per minute during retroactive or bulk work.

### Icon sets (keyword → emoji)

- Build an **editable list** of keyword → emoji rules (one or more “sets” the user can switch or merge). Priority order and conflict resolution (longest match, first match) TBD in implementation.
- **Default set** may be **prepopulated** from public keyword→emoji tables that approximate common English words to emoji.
- **Create, import, export** of sets for specialized domains. Shared sets can be published via **Autosidia** and imported from the community registry; see [SPEC.md](SPEC.md#autosidia-community-registry).

## Auto–Pixel Banner

Works with [Pixel Banner](https://github.com/jparkerweb/pixel-banner) to place header images. Reference: [eQuillabs — Pixel Banner](https://www.equilllabs.com/projects/pixel-banner/).

### Settings and behavior

- **Autoimage: Button** — Adds a **web image search** (or image discovery) action near Pixel Banner’s existing controls so the user can pick header images; store **multiple candidates** for selection when appropriate.
- **Autoimage: New** — When on, add a banner image for new pages (scope: all notes or configurable patterns — TBD).
- **Autoimage: Retroactive** — Scan pages missing a banner and add images over time.
- **Autoimage: Scan rate limit** — Maximum automatic banner assignments per minute.

## Accessibility and safety

- Long-running or network-backed operations should be **cancellable** where feasible and must respect **rate limits** in settings. Exact progress UI (status bar, notice) TBD.
