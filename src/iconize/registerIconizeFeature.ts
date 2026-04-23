import { TFile, TFolder, Notice } from "obsidian";
import type AutosidianPlugin from "../main";
import { isUnderObsidianConfig } from "../safePath";
import { iterateAllFoldersNotRoot } from "../folderNotes/iterFolders";
import { applyIconToFolder } from "./applyIconFrontmatter";
import { pickIconForTitle } from "./keywordMatch";

export function registerIconizeFeature(plugin: AutosidianPlugin): void {
	plugin.app.workspace.onLayoutReady(() => {
		plugin.registerEvent(
			plugin.app.vault.on("create", (f) => {
				if (f instanceof TFolder) {
					void onFolderCreated(plugin, f);
				}
			})
		);
		plugin.registerEvent(
			plugin.app.vault.on("rename", (f, oldPath) => {
				if (f instanceof TFolder) {
					void onFolderCreated(plugin, f);
				} else if (f instanceof TFile && f.path.endsWith(".md")) {
					void onMaybeFolderNoteRenamed(plugin, f, oldPath);
				}
			})
		);
		if (plugin.settings.iconize.retro) {
			void startIconRetro(plugin, true);
		}
	});

	plugin.addCommand({
		id: "autosidian-apply-icon-selection",
		name: "Apply keyword icon to selected folder (folder note)",
		checkCallback: (checking) => {
			const f = plugin.app.workspace.getActiveFile();
			if (!f || f.extension !== "md") {
				return false;
			}
			const p = f.parent;
			if (!p || !(p instanceof TFolder) || p.isRoot()) {
				return false;
			}
			if (p.name !== f.basename) {
				return false;
			}
			if (!checking) {
				void (async () => {
					const ok = await applyIconToFolder(plugin.app, p, plugin.settings.iconize);
					new Notice(
						ok ? "Autosidian: icon applied (if it matched a keyword)." : "Autosidian: no icon change (disabled, no match, or icon present)."
					);
				})();
			}
			return true;
		},
	});
}

async function onFolderCreated(plugin: AutosidianPlugin, folder: TFolder): Promise<void> {
	if (isUnderObsidianConfig(folder.path) || !plugin.settings.iconize.newAndRename || !plugin.settings.iconize.enabled) {
		return;
	}
	await applyIconToFolder(plugin.app, folder, plugin.settings.iconize);
}

async function onMaybeFolderNoteRenamed(
	plugin: AutosidianPlugin,
	_file: TFile,
	_oldPath: string
): Promise<void> {
	if (!plugin.settings.iconize.newAndRename || !plugin.settings.iconize.enabled) {
		return;
	}
	// re-run for parent folder of this note if it is a folder note
	const p = _file.parent;
	if (p && p instanceof TFolder && !p.isRoot() && p.name === _file.basename) {
		await applyIconToFolder(plugin.app, p, plugin.settings.iconize);
	}
}

export async function startIconRetro(plugin: AutosidianPlugin, announce: boolean): Promise<void> {
	const all: TFolder[] = [];
	for (const f of iterateAllFoldersNotRoot(plugin.app.vault.getRoot())) {
		if (isUnderObsidianConfig(f.path)) {
			continue;
		}
		// only queue if a keyword would match
		if (pickIconForTitle(f.name, plugin.settings.iconize.rules)) {
			all.push(f);
		}
	}
	plugin.iconizeRetro.refresh(announce, all);
}
