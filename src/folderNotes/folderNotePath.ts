import { TFile, TFolder, normalizePath } from "obsidian";

/** Default Folder Notes style: `FolderName/FolderName.md` */
export function getFolderNotePath(folder: TFolder): string {
	return normalizePath(`${folder.path}/${folder.name}.md`);
}

/** True if this markdown file is already the folder note for its parent folder. */
export function isFolderNoteFile(file: TFile): boolean {
	if (file.extension !== "md") {
		return false;
	}
	const parent = file.parent;
	if (!parent || !(parent instanceof TFolder) || parent.isRoot()) {
		return false;
	}
	return file.basename === parent.name;
}
