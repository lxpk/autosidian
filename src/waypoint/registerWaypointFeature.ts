import { TFile, TFolder, Notice } from "obsidian";
import type AutosidianPlugin from "../main";
import { getFolderNotePath } from "../folderNotes/folderNotePath";
import { isUnderObsidianConfig } from "../safePath";
import { buildWaypointPatchedContent } from "./waypointCheck";
import { fileNeedsWaypointContent, listFolderNotesCandidateForWaypoint } from "./waypointList";

export function registerWaypointFeature(plugin: AutosidianPlugin): void {
	plugin.app.workspace.onLayoutReady(() => {
		plugin.registerEvent(
			plugin.app.vault.on("create", (f) => {
				void onCreate(plugin, f);
			})
		);
		if (plugin.settings.waypoint.retro) {
			void startWaypointRetro(plugin, true);
		}
	});

	plugin.addCommand({
		id: "autosidian-add-waypoint",
		name: "Add %% Waypoint %% to active folder note (if needed)",
		checkCallback: (checking) => {
			const f = plugin.app.workspace.getActiveFile();
			if (!f) {
				return false;
			}
			if (!checking) {
				void runWaypointOnFile(plugin, f);
			}
			return true;
		},
	});

	plugin.registerEvent(
		plugin.app.workspace.on("file-menu", (menu, file) => {
			if (!(file instanceof TFile) || file.extension !== "md") {
				return;
			}
			menu.addItem((item) => {
				item.setTitle("Add %% Waypoint %% (if needed) — Autosidian");
				item.setSection("autosidian");
				item.onClick(() => {
					void runWaypointOnFile(plugin, file);
				});
			});
		})
	);
}

async function runWaypointOnFile(plugin: AutosidianPlugin, file: TFile): Promise<void> {
	try {
		const next = await buildWaypointPatchedContent(file, file.vault);
		if (next) {
			await file.vault.modify(file, next);
			new Notice("Autosidian: Waypoint token inserted.");
		} else {
			new Notice("Autosidian: No waypoint change (not a folder note, no subfolders, or already has Waypoint).");
		}
	} catch (e) {
		console.error(e);
		new Notice("Autosidian: failed to edit note — see console.");
	}
}

async function onCreate(plugin: AutosidianPlugin, file: { path: string } & import("obsidian").TAbstractFile): Promise<void> {
	if (isUnderObsidianConfig(file.path)) {
		return;
	}
	if (file instanceof TFile) {
		if (!plugin.settings.waypoint.newFolderNotes) {
			return;
		}
		const next = await buildWaypointPatchedContent(file, plugin.app.vault);
		if (next) {
			await plugin.app.vault.modify(file, next);
		}
		return;
	}
	if (file instanceof TFolder) {
		if (!plugin.settings.waypoint.onChildFolderCreate) {
			return;
		}
		const p = file.parent;
		if (p && p instanceof TFolder && !p.isRoot()) {
			const norm = getFolderNotePath(p);
			const t = plugin.app.vault.getAbstractFileByPath(norm) as TFile | null;
			if (t && t instanceof TFile) {
				const next = await buildWaypointPatchedContent(t, plugin.app.vault);
				if (next) {
					await plugin.app.vault.modify(t, next);
				}
			}
		}
	}
}

export async function startWaypointRetro(plugin: AutosidianPlugin, announce: boolean): Promise<void> {
	const cands = listFolderNotesCandidateForWaypoint(plugin.app.vault);
	const need: TFile[] = [];
	for (const f of cands) {
		if (await fileNeedsWaypointContent(f, plugin.app.vault)) {
			need.push(f);
		}
	}
	plugin.waypointRetro.refresh(announce, need);
}
