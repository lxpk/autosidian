import type { App, TFolder } from "obsidian";

/**
 * [Iconize](https://florianwoelki.github.io/obsidian-iconize/) manifest `id` (folder name on disk: `obsidian-icon-folder`).
 * Front matter is processed with the **.md** path; the **file explorer** row for the *folder* uses the **folder** path
 * in Iconize’s `data`, so a folder icon may be missing until we also register the same icon on `folder.path`.
 */
export const OBSIDIAN_ICONIZE_PLUGIN_ID = "obsidian-icon-folder";

type IconizeApi = { addFolderIcon?: (path: string, icon: string) => void };

/**
 * Pushes the same icon into Iconize’s internal map for the **folder** path so the
 * file explorer shows the icon next to the folder (not only the inner folder note file).
 * Safe to call if Iconize is disabled or an older build without this method.
 */
export function syncIconizeFolderExplorerPath(app: App, folder: TFolder, icon: string): void {
	const raw = (app as { plugins?: { plugins?: Record<string, unknown> } })?.plugins?.plugins?.[
		OBSIDIAN_ICONIZE_PLUGIN_ID
	];
	const p = raw as IconizeApi | undefined;
	if (!p || typeof p.addFolderIcon !== "function") {
		return;
	}
	p.addFolderIcon(folder.path, icon);
}
