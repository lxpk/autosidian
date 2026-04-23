import type { TFolder, Vault } from "obsidian";
import { getFolderNotePath } from "./folderNotePath";

/** Create `Name/Name.md` if missing. No-op for vault root. */
export async function ensureFolderNoteForFolder(vault: Vault, folder: TFolder): Promise<void> {
	if (folder.isRoot()) {
		return;
	}
	const path = getFolderNotePath(folder);
	if (vault.getAbstractFileByPath(path) !== null) {
		return;
	}
	try {
		await vault.create(path, "");
	} catch (e) {
		console.error("[Autosidian] ensureFolderNoteForFolder", path, e);
		throw e;
	}
}
