import type { TFile, Vault } from "obsidian";
import { isUnderObsidianConfig } from "../safePath";
import type { PixelBannerSettings } from "../settings";
import { hasBannerValue } from "./applyBanner";

export function listMarkdownWithoutBanner(
	vault: Vault,
	s: PixelBannerSettings,
	app: import("obsidian").App
): TFile[] {
	const out: TFile[] = [];
	for (const f of vault.getMarkdownFiles()) {
		if (isUnderObsidianConfig(f.path)) {
			continue;
		}
		const c = app.metadataCache.getFileCache(f);
		const front = c?.frontmatter as Record<string, unknown> | undefined;
		if (!hasBannerValue(front ?? {}, s.bannerField)) {
			out.push(f);
		}
	}
	return out;
}
