import { TFile, TFolder } from "obsidian";
import type AutosidianPlugin from "../main";
import { isUnderObsidianConfig } from "../safePath";
import { ensureFolderNoteForFolder } from "./ensureFolderNote";
import { isFolderNoteFile } from "./folderNotePath";
import { convertMarkdownNoteIntoFolderWithFolderNote } from "./convertNoteToFolder";

export function registerFolderNotesFeature(plugin: AutosidianPlugin): void {
	plugin.app.workspace.onLayoutReady(() => {
		plugin.registerEvent(
			plugin.app.vault.on("create", (f) => {
				void handleVaultCreate(plugin, f);
			})
		);
		if (plugin.settings.folderNotes.retroactive) {
			plugin.folderNotesRetro.refresh(true);
		}
	});

	plugin.addCommand({
		id: "autosidian-convert-note-to-folder",
		name: "Convert active note to folder with folder note",
		checkCallback: (checking) => {
			const f = plugin.app.workspace.getActiveFile();
			if (!f || f.extension !== "md" || isFolderNoteFile(f)) {
				return false;
			}
			if (!checking) {
				void convertMarkdownNoteIntoFolderWithFolderNote(f, plugin.app, plugin.reentrySkipAutoFolderNote);
			}
			return true;
		},
	});

	plugin.registerEvent(
		plugin.app.workspace.on("file-menu", (menu, file) => {
			if (!(file instanceof TFile) || file.extension !== "md" || isFolderNoteFile(file)) {
				return;
			}
			menu.addItem((item) => {
				item.setTitle("Convert to folder with folder note");
				item.setSection("autosidian");
				item.onClick(() => {
					void convertMarkdownNoteIntoFolderWithFolderNote(file, plugin.app, plugin.reentrySkipAutoFolderNote);
				});
			});
		})
	);
}

async function handleVaultCreate(
	plugin: AutosidianPlugin,
	file: import("obsidian").TAbstractFile
): Promise<void> {
	if (isUnderObsidianConfig(file.path)) {
		return;
	}
	if (file instanceof TFolder) {
		if (!plugin.settings.folderNotes.newFolders) {
			return;
		}
		if (file.isRoot()) {
			return;
		}
		if (plugin.reentrySkipAutoFolderNote.has(file.path)) {
			return;
		}
		try {
			await ensureFolderNoteForFolder(file.vault, file);
		} catch (e) {
			console.error("[Autosidian] new-folder folder note", e);
		}
		return;
	}
	if (file instanceof TFile) {
		if (!plugin.settings.folderNotes.newNotes) {
			return;
		}
		if (file.extension !== "md") {
			return;
		}
		if (isFolderNoteFile(file)) {
			return;
		}
		try {
			await convertMarkdownNoteIntoFolderWithFolderNote(file, plugin.app, plugin.reentrySkipAutoFolderNote);
		} catch (e) {
			console.error("[Autosidian] new-note → folder", e);
		}
	}
}
