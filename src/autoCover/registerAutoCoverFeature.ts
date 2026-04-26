import { TFile } from "obsidian";
import type AutosidianPlugin from "../main";
import { isUnderObsidianConfig } from "../safePath";
import { listMarkdownWithoutCover } from "./listMissingCover";
import { coverQueryCandidates, noteTitleAsCoverQuery } from "./coverQueries";
import { setCoverOnFile, hasCoverValue } from "./applyCover";
import { hasBannerValue } from "../pixelBanner/applyBanner";
import { searchFirstCover } from "./coverSearch";
import { obsidianCoverHttp } from "./coverHttp";
import { CoverPickModal } from "./CoverPickModal";

export function registerAutoCoverFeature(plugin: AutosidianPlugin): void {
	plugin.app.workspace.onLayoutReady(() => {
		plugin.registerEvent(
			plugin.app.vault.on("create", (f) => {
				if (f instanceof TFile) {
					void onFileCreate(plugin, f);
				}
			})
		);
		if (plugin.settings.autoCover.retro) {
			void startCoverRetro(plugin, true);
		}
	});

	plugin.addCommand({
		id: "autosidian-pick-cover-candidates",
		name: "Pick cover image from keyword candidates (Auto–Cover) — current note",
		checkCallback: (checking) => {
			const f = plugin.app.workspace.getActiveFile();
			if (!f) {
				return false;
			}
			if (!checking) {
				const n = plugin.settings.autoCover.candidateCount;
				const count = Math.max(1, Math.min(5, n));
				const seed = plugin.settings.autoCover.ignoreTitleForSeed ? "pick" : f.basename;
				const queries = coverQueryCandidates(
					seed,
					count,
					plugin.settings.autoCover.ignoreTitleForSeed
				);
				const modal = new CoverPickModal(plugin.app, plugin, f, queries);
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
	const s = plugin.settings.autoCover;
	if (!s.enabled || !s.newNotes) {
		return;
	}
	const c = plugin.app.metadataCache.getFileCache(file);
	const front = (c?.frontmatter as Record<string, unknown> | undefined) ?? {};
	if (hasCoverValue(front, s.coverField)) {
		return;
	}
	if (s.skipIfBannerPresent && hasBannerValue(front, plugin.settings.pixelBanner.bannerField)) {
		return;
	}
	const query = noteTitleAsCoverQuery(file.basename, s.ignoreTitleForSeed);
	if (!query) {
		return;
	}
	try {
		const hit = await searchFirstCover(query, s, obsidianCoverHttp);
		if (hit) {
			await setCoverOnFile(plugin.app, file, hit.url, s);
		}
	} catch (e) {
		console.error("[Autosidian] cover new note", e);
	}
}

export async function startCoverRetro(plugin: AutosidianPlugin, announce: boolean): Promise<void> {
	const list = listMarkdownWithoutCover(
		plugin.app.vault,
		plugin.settings.autoCover,
		plugin.settings.pixelBanner,
		plugin.app
	);
	plugin.autoCoverRetro.refresh(announce, list);
}
