import { Plugin } from "obsidian";
import { migrateSettings } from "./migrateSettings";
import { AutosidianSettingTab } from "./ui/AutosidianSettingTab";
import { DEFAULT_SETTINGS, type AutosidianSettings } from "./settings";
import { registerFolderNotesFeature } from "./folderNotes/registerFolderNotesFeature";
import { RetroactiveFolderNotes } from "./folderNotes/retroactiveQueue";
import { registerWaypointFeature } from "./waypoint/registerWaypointFeature";
import { RetroactiveWaypointQueue } from "./waypoint/retroactiveWaypointQueue";
import { registerIconizeFeature } from "./iconize/registerIconizeFeature";
import { RetroactiveIconizeQueue } from "./iconize/retroactiveIconizeQueue";
import { registerPixelBannerFeature } from "./pixelBanner/registerPixelBannerFeature";
import { RetroactivePixelQueue } from "./pixelBanner/retroactivePixelQueue";

export default class AutosidianPlugin extends Plugin {
	settings: AutosidianSettings = DEFAULT_SETTINGS;
	/** Stops the new-folder auto-note pass from double-creating when we convert a note. */
	reentrySkipAutoFolderNote: Set<string> = new Set();
	folderNotesRetro = new RetroactiveFolderNotes(this);
	waypointRetro = new RetroactiveWaypointQueue(this);
	iconizeRetro = new RetroactiveIconizeQueue(this);
	pixelRetro = new RetroactivePixelQueue(this);

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new AutosidianSettingTab(this.app, this));
		registerFolderNotesFeature(this);
		registerWaypointFeature(this);
		registerIconizeFeature(this);
		registerPixelBannerFeature(this);
	}

	onunload(): void {
		this.folderNotesRetro.halt();
		this.waypointRetro.halt();
		this.iconizeRetro.halt();
		this.pixelRetro.halt();
	}

	async loadSettings(): Promise<void> {
		this.settings = migrateSettings(await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
