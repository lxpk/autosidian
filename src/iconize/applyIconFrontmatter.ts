import type { App } from "obsidian";
import { TFile, TFolder } from "obsidian";
import { isUnderObsidianConfig } from "../safePath";
import { getFolderNotePath } from "../folderNotes/folderNotePath";
import { findMostSimilarEmoji } from "./emojiSimilarity";
import { iconizeResolveOptions, resolveIconForFolderName } from "./keywordMatch";
import { syncIconizeFolderExplorerPath } from "./syncIconizeFolderExplorerPath";
import type { IconizeSettings } from "../settings";

export function getFolderNoteFile(folder: TFolder, app: App): TFile | null {
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
	const icon = resolveIconForFolderName(folder.name, s.rules, s.defaultIcon, iconizeResolveOptions(s));
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
	if (applied && s.syncIconizeFolderRow) {
		syncIconizeFolderExplorerPath(app, folder, icon);
	}
	return applied;
}

export type BestEmojiApplyResult =
	| { ok: true; emoji: string }
	| { ok: false; reason: "disabled" | "no-note" | "no-match" | "skip-present" | "path" };

/**
 * Sets the folder note’s icon field to the **single best** emojilib match for the **folder name**
 * (ignores custom keyword table and default icon). For explicit user actions (file menu).
 */
export async function applyBestMatchingEmojiToFolder(
	app: App,
	folder: TFolder,
	s: IconizeSettings
): Promise<BestEmojiApplyResult> {
	if (folder.isRoot() || isUnderObsidianConfig(folder.path)) {
		return { ok: false, reason: "path" };
	}
	if (!s.enabled) {
		return { ok: false, reason: "disabled" };
	}
	const note = getFolderNoteFile(folder, app);
	if (!note) {
		return { ok: false, reason: "no-note" };
	}
	const emoji = findMostSimilarEmoji(folder.name);
	if (!emoji) {
		return { ok: false, reason: "no-match" };
	}
	let applied = false;
	await app.fileManager.processFrontMatter(note, (front) => {
		if (s.skipIfIconPresent && hasIconInFrontMatter(front, s.iconField)) {
			return;
		}
		(front as Record<string, string>)[s.iconField] = emoji;
		applied = true;
	});
	if (!applied) {
		return { ok: false, reason: "skip-present" };
	}
	if (s.syncIconizeFolderRow) {
		syncIconizeFolderExplorerPath(app, folder, emoji);
	}
	return { ok: true, emoji };
}
