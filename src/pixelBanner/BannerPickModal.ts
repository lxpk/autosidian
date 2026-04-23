import { App, FuzzySuggestModal, TFile } from "obsidian";
import type AutosidianPlugin from "../main";
import { setBannerOnFile } from "./applyBanner";

export class BannerPickModal extends FuzzySuggestModal<string> {
	candidates: string[];
	file: TFile;
	plugin: AutosidianPlugin;

	constructor(app: App, plugin: AutosidianPlugin, file: TFile, candidates: string[]) {
		super(app);
		this.plugin = plugin;
		this.file = file;
		this.candidates = candidates;
		this.setPlaceholder("Pick a Pixel Banner search keyword (Pexels API)");
	}

	getItems(): string[] {
		return this.candidates;
	}

	getItemText(item: string): string {
		return item;
	}

	async onChooseItem(item: string, _evt: MouseEvent | KeyboardEvent): Promise<void> {
		await setBannerOnFile(this.plugin.app, this.file, item, this.plugin.settings.pixelBanner);
	}
}
