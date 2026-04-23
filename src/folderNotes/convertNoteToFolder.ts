import type { App, TFile, TFolder } from "obsidian";
import { Notice, normalizePath } from "obsidian";
import { isFolderNoteFile } from "./folderNotePath";

/**
 * `Parent/MyNote.md` -> `Parent/MyNote/MyNote.md` (same for note at vault root: `X.md` -> `X/X.md`).
 * Skips if already in folder-note layout or a file/folder already uses the path.
 * `reentrySkip` — set `folderPath` on this while mutating the vault so the "new folder" pass does not add an extra empty `Name/Name.md` before the converted content is written.
 */
export async function convertMarkdownNoteIntoFolderWithFolderNote(
	file: TFile,
	app: App,
	reentrySkip: Set<string>
): Promise<void> {
	if (file.extension !== "md") {
		return;
	}
	if (isFolderNoteFile(file)) {
		return;
	}
	const parent = file.parent;
	if (!parent) {
		return;
	}
	const base = file.basename;
	const folderPath = parent.isRoot() ? base : normalizePath(`${(parent as TFolder).path}/${base}`);
	const existing = app.vault.getAbstractFileByPath(folderPath);
	if (existing) {
		new Notice("Autosidian: a file or folder with that name already exists — not converting.");
		return;
	}
	let content: string;
	try {
		content = await app.vault.read(file);
	} catch (e) {
		console.error("[Autosidian] read before convert", e);
		return;
	}
	reentrySkip.add(folderPath);
	try {
		await app.vault.delete(file);
		await app.vault.createFolder(folderPath);
		const notePath = normalizePath(`${folderPath}/${base}.md`);
		await app.vault.create(notePath, content);
	} catch (e) {
		console.error("[Autosidian] convertNoteToFolder", e);
		new Notice("Autosidian: failed to convert note to folder — see console.");
	} finally {
		reentrySkip.delete(folderPath);
	}
}
