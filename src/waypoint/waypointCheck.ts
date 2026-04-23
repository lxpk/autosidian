import { TFile, TFolder } from "obsidian";
import { isFolderNoteFile } from "../folderNotes/folderNotePath";
import { isUnderObsidianConfig } from "../safePath";
import { alreadyHasWaypoint, insertWaypointMarker } from "./waypointMarkdown";

export function parentFolderHasSubfolders(folder: TFolder): boolean {
	return folder.children.some((c) => c instanceof TFolder);
}

export function shouldProcessWaypointOnFolderNote(
	file: TFile,
	needSubfolders: boolean
): { ok: true; parent: TFolder } | { ok: false } {
	if (file.extension !== "md" || isUnderObsidianConfig(file.path)) {
		return { ok: false };
	}
	if (!isFolderNoteFile(file)) {
		return { ok: false };
	}
	const parent = file.parent;
	if (!parent || !(parent instanceof TFolder) || parent.isRoot()) {
		return { ok: false };
	}
	if (isUnderObsidianConfig(parent.path)) {
		return { ok: false };
	}
	if (needSubfolders && !parentFolderHasSubfolders(parent)) {
		return { ok: false };
	}
	return { ok: true, parent };
}

/** Read, insert marker if needed, return new content or null if unchanged. */
export async function buildWaypointPatchedContent(file: TFile, vault: import("obsidian").Vault): Promise<string | null> {
	const t = shouldProcessWaypointOnFolderNote(file, true);
	if (t.ok === false) {
		return null;
	}
	const content = await vault.read(file);
	if (alreadyHasWaypoint(content)) {
		return null;
	}
	return insertWaypointMarker(content);
}
