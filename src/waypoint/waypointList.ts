import type { Vault } from "obsidian";
import { TFile, TFolder } from "obsidian";
import { isFolderNoteFile } from "../folderNotes/folderNotePath";
import { isUnderObsidianConfig } from "../safePath";
import { alreadyHasWaypoint } from "./waypointMarkdown";
import { parentFolderHasSubfolders } from "./waypointCheck";

export function listFolderNotesCandidateForWaypoint(vault: Vault): TFile[] {
	const out: TFile[] = [];
	for (const f of vault.getMarkdownFiles()) {
		if (isUnderObsidianConfig(f.path)) {
			continue;
		}
		if (!isFolderNoteFile(f)) {
			continue;
		}
		const p = f.parent;
		if (!p || !(p instanceof TFolder) || p.isRoot()) {
			continue;
		}
		if (!parentFolderHasSubfolders(p)) {
			continue;
		}
		out.push(f);
	}
	return out;
}

export async function fileNeedsWaypointContent(file: TFile, vault: Vault): Promise<boolean> {
	const c = await vault.read(file);
	return !alreadyHasWaypoint(c);
}
