import type { App } from "obsidian";
import { TFile, TFolder } from "obsidian";
import { isUnderObsidianConfig } from "../safePath";
import { getFolderNotePath } from "../folderNotes/folderNotePath";
import { pickIconForTitle } from "./keywordMatch";
import type { IconizeSettings } from "../settings";

function getFolderNoteFile(folder: TFolder, app: App): TFile | null {
	const p = getFolderNotePath(folder);
	const t = app.vault.getAbstractFileByPath(p);
	return t && t instanceof TFile ? t : null;
}

export function hasIconInFrontMatter(front: Record<string, unknown>, field: string): boolean {
	const v = front[field];
	if (v === null || v === undefined) {
		return false;
	}
	if (typeof v === "string" && v.trim() === "") {
		return false;
	}
	return true;
}

export async function applyIconToFolder(
	app: App,
	folder: TFolder,
	s: IconizeSettings
): Promise<boolean> {
	if (folder.isRoot() || isUnderObsidianConfig(folder.path)) {
		return false;
	}
	if (!s.enabled) {
		return false;
	}
	const note = getFolderNoteFile(folder, app);
	if (!note) {
		return false;
	}
	const icon = pickIconForTitle(folder.name, s.rules);
	if (!icon) {
		return false;
	}
	let applied = false;
	await app.fileManager.processFrontMatter(note, (front) => {
		if (s.skipIfIconPresent && hasIconInFrontMatter(front, s.iconField)) {
			return;
		}
		(front as Record<string, string>)[s.iconField] = icon;
		applied = true;
	});
	return applied;
}
