import type { App, TFile } from "obsidian";
import { isUnderObsidianConfig } from "../safePath";
import type { AutoCoverSettings } from "../settings";

export function hasCoverValue(front: Record<string, unknown>, field: string): boolean {
	const v = front[field];
	if (v === null || v === undefined) {
		return false;
	}
	return String(v).trim() !== "";
}

/**
 * Write the chosen cover image URL (or wikilink, or hex) to the configured front matter field.
 * Skips files inside the `.obsidian/` config folder. The caller is responsible for ensuring
 * `coverValue` is non-empty (for example by running an image search first).
 */
export async function setCoverOnFile(
	app: App,
	file: TFile,
	coverValue: string,
	s: AutoCoverSettings
): Promise<void> {
	if (isUnderObsidianConfig(file.path)) {
		return;
	}
	const v = (coverValue ?? "").trim();
	if (!v) {
		return;
	}
	await app.fileManager.processFrontMatter(file, (front) => {
		(front as Record<string, string>)[s.coverField] = v;
	});
}
