import type { App, TFile, Vault } from "obsidian";
import { isUnderObsidianConfig } from "../safePath";
import type { AutoCoverSettings, PixelBannerSettings } from "../settings";
import { hasCoverValue } from "./applyCover";
import { hasBannerValue } from "../pixelBanner/applyBanner";

/**
 * Markdown files lacking a `cover` value. When `skipIfBannerPresent` is on, files that already
 * have a Pixel Banner `banner` value are skipped so the two automations don't double up.
 */
export function listMarkdownWithoutCover(
	vault: Vault,
	cover: AutoCoverSettings,
	pixel: PixelBannerSettings,
	app: App
): TFile[] {
	const out: TFile[] = [];
	for (const f of vault.getMarkdownFiles()) {
		if (isUnderObsidianConfig(f.path)) {
			continue;
		}
		const c = app.metadataCache.getFileCache(f);
		const front = (c?.frontmatter as Record<string, unknown> | undefined) ?? {};
		if (hasCoverValue(front, cover.coverField)) {
			continue;
		}
		if (cover.skipIfBannerPresent && hasBannerValue(front, pixel.bannerField)) {
			continue;
		}
		out.push(f);
	}
	return out;
}
