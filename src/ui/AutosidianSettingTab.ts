import { App, PluginSettingTab, Setting } from "obsidian";
import type AutosidianPlugin from "../main";
import { getMissingRequiredPlugins } from "../deps/requiredPlugins";
import { addAutomationSettingsSections } from "./moreSettings";

export class AutosidianSettingTab extends PluginSettingTab {
	plugin: AutosidianPlugin;

	constructor(app: App, plugin: AutosidianPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		const { settings } = this.plugin;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Autosidian" });
		containerEl.createEl("p", {
			text: "Automates Folder Notes, Waypoint, Iconize, and Pixel Banner. The four required community plugins should be installed and enabled before automation is useful.",
		});

		const missing = getMissingRequiredPlugins(this.app);
		if (missing.length > 0) {
			const warn = containerEl.createDiv({ cls: "autosidian-settings-notice" });
			warn.createEl("strong", { text: "Required plugins not enabled: " });
			warn.appendText(missing.map((m) => `${m.name} (${m.id})`).join(", "));
			warn.createEl("p", {
				text: "Install them from Community plugins, enable each one, then reload or revisit this tab.",
			});
		} else {
			containerEl.createEl("p", { text: "All required community plugins are enabled.", cls: "autosidian-ok" });
		}

		containerEl.createEl("h3", { text: "Auto–Folder Notes" });
		containerEl.createEl("p", {
			cls: "setting-item-description",
			text: "Creates a folder note `Name/Name.md` to match the Folder Notes plugin. Enable toggles with care; “New note → folder” rewrites the vault on new markdown files that are not already folder notes.",
		});

		const fn = settings.folderNotes;
		const save = async () => {
			await this.plugin.saveSettings();
		};

		new Setting(containerEl)
			.setName("New folders")
			.setDesc("When a new folder is created, add `Name/Name.md` if missing.")
			.addToggle((t) =>
				t.setValue(fn.newFolders).onChange(async (v) => {
					this.plugin.settings.folderNotes.newFolders = v;
					await save();
				})
			);

		new Setting(containerEl)
			.setName("New notes → folder with folder note")
			.setDesc("When a new .md file is created and it is not already a folder note, turn it into `Title/Title.md` with the same content (same shape as the command / context menu).")
			.addToggle((t) =>
				t.setValue(fn.newNotes).onChange(async (v) => {
					this.plugin.settings.folderNotes.newNotes = v;
					await save();
				})
			);

		new Setting(containerEl)
			.setName("Retroactive (missing folder notes)")
			.setDesc(
				"When on, runs a one-per-interval queue of folders that lack `Name/Name.md`, up to the rate below. Toggling on refills the queue. When the queue is empty, the timer stops until you toggle this off and on or reload with retro still on."
			)
			.addToggle((t) =>
				t.setValue(fn.retroactive).onChange(async (v) => {
					this.plugin.settings.folderNotes.retroactive = v;
					await save();
					if (v) {
						this.plugin.folderNotesRetro.refresh(true);
					} else {
						this.plugin.folderNotesRetro.halt();
					}
				})
			);

		new Setting(containerEl)
			.setName("Retro max per minute")
			.setDesc("Approximate (1–120) folder notes per minute while retro is working through a non-empty queue.")
			.addSlider((s) => {
				s.setLimits(1, 120, 1);
				s.setValue(fn.retroactivePerMinute);
				s.setInstant(false);
				s.setDynamicTooltip();
				s.onChange(async (v) => {
					this.plugin.settings.folderNotes.retroactivePerMinute = v;
					await save();
					this.plugin.folderNotesRetro.restartTimer();
				});
			});

		addAutomationSettingsSections(containerEl, this.plugin);

		new Setting(containerEl)
			.setName("Version")
			.setDesc("Stored settings version (migrations).")
			.addText((t) => {
				t.setValue(String(this.plugin.settings.settingsVersion));
				t.setDisabled(true);
			});
	}
}
