import { TFile, Notice } from "obsidian";
import type AutosidianPlugin from "../main";
import { isUnderObsidianConfig } from "../safePath";
import { listMarkdownWithoutBanner } from "./listMissingBanner";
import { keywordsForTitle, noteTitleAsBannerKeyword } from "./keywordsForBanner";
import { setBannerOnFile } from "./applyBanner";
import { BannerPickModal } from "./BannerPickModal";

export function registerPixelBannerFeature(plugin: AutosidianPlugin): void {
	plugin.app.workspace.onLayoutReady(() => {
		plugin.registerEvent(
			plugin.app.vault.on("create", (f) => {
				if (f instanceof TFile) {
					void onFileCreate(plugin, f);
				}
			})
		);
		if (plugin.settings.pixelBanner.retro) {
			void startPixelRetro(plugin, true);
		}
	});

	plugin.addCommand({
		id: "autosidian-pick-banner-candidates",
		name: "Pick banner from keyword candidates (Pixel Banner / Pexels) — current note",
		checkCallback: (checking) => {
			const f = plugin.app.workspace.getActiveFile();
			if (!f) {
				return false;
			}
			if (!checking) {
				const n = plugin.settings.pixelBanner.candidateCount;
				const count = Math.max(1, Math.min(5, n));
				const kws = keywordsForTitle(
					plugin.settings.pixelBanner.ignoreTitleForSeed ? "pick" : f.basename,
					count,
					plugin.settings.pixelBanner.ignoreTitleForSeed
				);
				const modal = new BannerPickModal(plugin.app, plugin, f, kws);
				modal.open();
			}
			return true;
		},
	});
}

async function onFileCreate(plugin: AutosidianPlugin, file: TFile): Promise<void> {
	if (file.extension !== "md" || isUnderObsidianConfig(file.path)) {
		return;
	}
	if (!plugin.settings.pixelBanner.enabled || !plugin.settings.pixelBanner.newNotes) {
		return;
	}
	const c = plugin.app.metadataCache.getFileCache(file);
	const f = c?.frontmatter;
	const field = plugin.settings.pixelBanner.bannerField;
	if (f && f[field] && String(f[field]).trim()) {
		return;
	}
	const banner = noteTitleAsBannerKeyword(file.basename, plugin.settings.pixelBanner.ignoreTitleForSeed);
	if (banner) {
		try {
			await setBannerOnFile(plugin.app, file, banner, plugin.settings.pixelBanner);
		} catch (e) {
			console.error("[Autosidian] pixel new note", e);
		}
	}
}

export async function startPixelRetro(plugin: AutosidianPlugin, announce: boolean): Promise<void> {
	const list = listMarkdownWithoutBanner(
		plugin.app.vault,
		plugin.settings.pixelBanner,
		plugin.app
	);
	plugin.pixelRetro.refresh(announce, list);
}
