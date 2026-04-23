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

/**
 * Atomically insert the short `%% Waypoint %%` token if the note needs it and does not
 * already have any Waypoint markers. Uses `vault.process` so we never overwrite a version
 * that changed between read and write (e.g. the Waypoint plugin expanding the block).
 * Returns the written string when a marker was inserted, else null (caller must not `modify` again).
 */
export async function buildWaypointPatchedContent(
	file: TFile,
	vault: import("obsidian").Vault
): Promise<string | null> {
	const t = shouldProcessWaypointOnFolderNote(file, true);
	if (t.ok === false) {
		return null;
	}
	let inserted = false;
	const written = await vault.process(file, (content) => {
		if (alreadyHasWaypoint(content)) {
			return content;
		}
		inserted = true;
		return insertWaypointMarker(content);
	});
	return inserted ? written : null;
}
