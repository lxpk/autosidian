import { TFolder } from "obsidian";
import { isUnderObsidianConfig } from "../safePath";
import { getFolderNotePath } from "./folderNotePath";

function* walkNonRootFolders(root: TFolder): Generator<TFolder> {
	for (const child of root.children) {
		if (child instanceof TFolder) {
			if (!child.isRoot()) {
				yield child;
			}
			yield* walkNonRootFolders(child);
		}
	}
}

/** Yields all non-root folders. */
export function* iterateAllFoldersNotRoot(vaultRoot: TFolder): Generator<TFolder> {
	yield* walkNonRootFolders(vaultRoot);
}

export function getFoldersMissingFolderNote(vaultRoot: TFolder): TFolder[] {
	const out: TFolder[] = [];
	for (const folder of iterateAllFoldersNotRoot(vaultRoot)) {
		if (folder.isRoot()) {
			continue;
		}
		if (isUnderObsidianConfig(folder.path)) {
			continue;
		}
		const p = getFolderNotePath(folder);
		if (folder.vault.getAbstractFileByPath(p) === null) {
			out.push(folder);
		}
	}
	return out;
}
