import { TFile, TFolder, Notice } from "obsidian";
import type AutosidianPlugin from "../main";
import { isFolderNoteFile } from "../folderNotes/folderNotePath";
import { isUnderObsidianConfig } from "../safePath";
import { iterateAllFoldersNotRoot } from "../folderNotes/iterFolders";
import { applyBestMatchingEmojiToFolder, applyIconToFolder, getFolderNoteFile } from "./applyIconFrontmatter";
import { iconizeResolveOptions, resolveIconForFolderName } from "./keywordMatch";

export function registerIconizeFeature(plugin: AutosidianPlugin): void {
	plugin.registerEvent(
		plugin.app.workspace.on("file-menu", (menu, file) => {
			if (!(file instanceof TFile) || file.extension !== "md") {
				return;
			}
			if (!isFolderNoteFile(file) || isUnderObsidianConfig(file.path)) {
				return;
			}
			const folder = file.parent;
			if (!folder || !(folder instanceof TFolder)) {
				return;
			}
			menu.addItem((item) => {
				item.setTitle("Autosidian: Auto-iconize best-matching emoji (from folder name)");
				item.setSection("autosidian");
				item.onClick(() => {
					void (async () => {
						const r = await applyBestMatchingEmojiToFolder(plugin.app, folder, plugin.settings.iconize);
						if (r.ok) {
							new Notice(`Autosidian: set ${plugin.settings.iconize.iconField} to ${r.emoji} (best match for “${folder.name}”).`);
						} else if (r.reason === "disabled") {
							new Notice("Autosidian: enable Auto–Iconize in settings first.");
						} else if (r.reason === "no-match") {
							new Notice(`Autosidian: no strong emoji match for “${folder.name}”.`);
						} else if (r.reason === "skip-present") {
							new Notice("Autosidian: skipped — icon already set (turn off “Skip if icon already set” to overwrite).");
						} else if (r.reason === "no-note") {
							new Notice("Autosidian: folder note file missing.");
						}
					})();
				});
			});
		})
	);

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
						ok
							? "Autosidian: icon applied to folder note (keyword or default icon)."
							: "Autosidian: no icon change (disabled, no keyword/default icon, or skip-if-present blocked)."
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

/**
 * After changing icon rules, default icon, or main toggles, call this when **Retro** is on so
 * the queue is rebuilt (otherwise a stale or empty queue never picks up the new `defaultIcon`).
 */
export function restartIconizeRetroIfEnabled(plugin: AutosidianPlugin): void {
	if (!plugin.settings.iconize.enabled || !plugin.settings.iconize.retro) {
		return;
	}
	plugin.iconizeRetro.halt();
	void startIconRetro(plugin, false);
}

export async function startIconRetro(plugin: AutosidianPlugin, announce: boolean): Promise<void> {
	const s = plugin.settings.iconize;
	const all: TFolder[] = [];
	for (const f of iterateAllFoldersNotRoot(plugin.app.vault.getRoot())) {
		if (isUnderObsidianConfig(f.path)) {
			continue;
		}
		if (!getFolderNoteFile(f, plugin.app)) {
			continue;
		}
		const ico = resolveIconForFolderName(f.name, s.rules, s.defaultIcon, iconizeResolveOptions(s));
		if (ico) {
			all.push(f);
		}
	}
	plugin.iconizeRetro.refresh(announce, all);
}
