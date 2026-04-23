import { App, FuzzySuggestModal, TFile } from "obsidian";
import type AutosidianPlugin from "../main";
import { setBannerOnFile } from "./applyBanner";

export class BannerPickModal extends FuzzySuggestModal<string> {
	urls: string[];
	file: TFile;
	plugin: AutosidianPlugin;

	constructor(app: App, plugin: AutosidianPlugin, file: TFile, urls: string[]) {
		super(app);
		this.plugin = plugin;
		this.file = file;
		this.urls = urls;
		this.setPlaceholder("Pick a banner image URL");
	}

	getItems(): string[] {
		return this.urls;
	}

	getItemText(item: string): string {
		return item;
	}

	async onChooseItem(item: string, _evt: MouseEvent | KeyboardEvent): Promise<void> {
		await setBannerOnFile(this.plugin.app, this.file, item, this.plugin.settings.pixelBanner);
	}
}
