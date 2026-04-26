import { Notice, Plugin } from "obsidian";
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
import { registerAutoCoverFeature } from "./autoCover/registerAutoCoverFeature";
import { RetroactiveCoverQueue } from "./autoCover/retroactiveCoverQueue";

export default class AutosidianPlugin extends Plugin {
	settings: AutosidianSettings = DEFAULT_SETTINGS;
	/** Stops the new-folder auto-note pass from double-creating when we convert a note. */
	reentrySkipAutoFolderNote: Set<string> = new Set();
	folderNotesRetro = new RetroactiveFolderNotes(this);
	waypointRetro = new RetroactiveWaypointQueue(this);
	iconizeRetro = new RetroactiveIconizeQueue(this);
	pixelRetro = new RetroactivePixelQueue(this);
	autoCoverRetro = new RetroactiveCoverQueue(this);

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new AutosidianSettingTab(this.app, this));
		this.addCommand({
			id: "autosidian-stop-all-retro-queues",
			name: "Stop all background retro queues (folder, waypoint, iconize, pixel, cover)",
			callback: () => {
				const a = this.folderNotesRetro.getQueueLength();
				const b = this.waypointRetro.getQueueLength();
				const c = this.iconizeRetro.getQueueLength();
				const d = this.pixelRetro.getQueueLength();
				const e = this.autoCoverRetro.getQueueLength();
				this.folderNotesRetro.halt();
				this.waypointRetro.halt();
				this.iconizeRetro.halt();
				this.pixelRetro.halt();
				this.autoCoverRetro.halt();
				new Notice(
					`Autosidian: stopped retro queues (had ${a} + ${b} + ${c} + ${d} + ${e} item(s) pending).`
				);
			},
		});
		registerFolderNotesFeature(this);
		registerWaypointFeature(this);
		registerIconizeFeature(this);
		registerPixelBannerFeature(this);
		registerAutoCoverFeature(this);
	}

	onunload(): void {
		this.folderNotesRetro.halt();
		this.waypointRetro.halt();
		this.iconizeRetro.halt();
		this.pixelRetro.halt();
		this.autoCoverRetro.halt();
	}

	async loadSettings(): Promise<void> {
		this.settings = migrateSettings(await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
