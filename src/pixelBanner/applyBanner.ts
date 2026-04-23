import type { App, TFile } from "obsidian";
import { isUnderObsidianConfig } from "../safePath";
import type { PixelBannerSettings } from "../settings";

export function hasBannerValue(front: Record<string, unknown>, field: string): boolean {
	const v = front[field];
	if (v === null || v === undefined) {
		return false;
	}
	return String(v).trim() !== "";
}

export async function setBannerOnFile(
	app: App,
	file: TFile,
	url: string,
	s: PixelBannerSettings
): Promise<void> {
	if (isUnderObsidianConfig(file.path)) {
		return;
	}
	await app.fileManager.processFrontMatter(file, (front) => {
		(front as Record<string, string>)[s.bannerField] = url;
	});
}
