import { App, FuzzySuggestModal, Notice, TFile } from "obsidian";
import type AutosidianPlugin from "../main";
import { setCoverOnFile } from "./applyCover";
import { searchFirstCover } from "./coverSearch";
import { obsidianCoverHttp } from "./coverHttp";

/**
 * Picker modal: shows N candidate search queries; on selection, runs an image search and
 * writes the chosen URL into the note's `cover` front matter field. Quiet on cancel; shows
 * a Notice on no-results so the user knows to try a different keyword.
 */
export class CoverPickModal extends FuzzySuggestModal<string> {
	candidates: string[];
	file: TFile;
	plugin: AutosidianPlugin;

	constructor(app: App, plugin: AutosidianPlugin, file: TFile, candidates: string[]) {
		super(app);
		this.plugin = plugin;
		this.file = file;
		this.candidates = candidates;
		this.setPlaceholder("Pick a search keyword to find a cover image");
	}

	getItems(): string[] {
		return this.candidates;
	}

	getItemText(item: string): string {
		return item;
	}

	async onChooseItem(item: string, _evt: MouseEvent | KeyboardEvent): Promise<void> {
		try {
			const hit = await searchFirstCover(
				item,
				this.plugin.settings.autoCover,
				obsidianCoverHttp
			);
			if (!hit) {
				new Notice(`Autosidian: no cover image found for "${item}".`);
				return;
			}
			await setCoverOnFile(this.plugin.app, this.file, hit.url, this.plugin.settings.autoCover);
			new Notice(`Autosidian: cover set from ${hit.source}.`);
		} catch (e) {
			console.error("[Autosidian] cover pick", e);
			new Notice("Autosidian: cover search failed — see console.");
		}
	}
}
