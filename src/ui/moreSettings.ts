import { Notice, Setting, type TextAreaComponent } from "obsidian";
import type AutosidianPlugin from "../main";
import { startWaypointRetro } from "../waypoint/registerWaypointFeature";
import { startIconRetro } from "../iconize/registerIconizeFeature";
import { startPixelRetro } from "../pixelBanner/registerPixelBannerFeature";
import { AutosidiaClient } from "../autosidia/AutosidiaClient";
import { exportSettingsToJson, importPresetJson, mergeImportedIntoSettings } from "../presets/presetIO";

export function addAutomationSettingsSections(containerEl: HTMLElement, plugin: AutosidianPlugin): void {
	const save = async () => {
		await plugin.saveSettings();
	};

	/* —— Waypoint —— */
	containerEl.createEl("h3", { text: "Auto–Waypoint" });
	containerEl.createEl("p", {
		cls: "setting-item-description",
		text: "Inserts %% Waypoint %% into folder notes that have subfolders and do not already contain Waypoint markers (see Waypoint plugin).",
	});
	const wp = plugin.settings.waypoint;
	new Setting(containerEl)
		.setName("New folder notes")
		.setDesc("When a new `Name/Name.md` is created and the folder has subfolders, insert the marker if missing.")
		.addToggle((t) =>
			t.setValue(wp.newFolderNotes).onChange(async (v) => {
				plugin.settings.waypoint.newFolderNotes = v;
				await save();
			})
		);
	new Setting(containerEl)
		.setName("When a subfolder is created")
		.setDesc("Update the parent folder’s folder note with a waypoint if needed.")
		.addToggle((t) =>
			t.setValue(wp.onChildFolderCreate).onChange(async (v) => {
				plugin.settings.waypoint.onChildFolderCreate = v;
				await save();
			})
		);
	new Setting(containerEl)
		.setName("Retro (missing waypoints)")
		.setDesc("Queue folder notes that still need the short token.")
		.addToggle((t) =>
			t.setValue(wp.retro).onChange(async (v) => {
				plugin.settings.waypoint.retro = v;
				await save();
				if (v) {
					void startWaypointRetro(plugin, true);
				} else {
					plugin.waypointRetro.halt();
				}
			})
		);
	new Setting(containerEl)
		.setName("Waypoint retro / minute")
		.addSlider((s) => {
			s.setLimits(1, 120, 1);
			s.setValue(wp.retroPerMinute);
			s.setInstant(false);
			s.setDynamicTooltip();
			s.onChange(async (v) => {
				plugin.settings.waypoint.retroPerMinute = v;
				await save();
				plugin.waypointRetro.restartTimer();
			});
		});

	/* —— Iconize —— */
	containerEl.createEl("h3", { text: "Auto–Iconize" });
	containerEl.createEl("p", {
		cls: "setting-item-description",
		text: "Sets the `icon` front matter field on folder notes (enable Iconize front matter / properties integration). Longest keyword match wins.",
	});
	const iz = plugin.settings.iconize;
	new Setting(containerEl)
		.setName("Enable Auto–Iconize")
		.addToggle((t) =>
			t.setValue(iz.enabled).onChange(async (v) => {
				plugin.settings.iconize.enabled = v;
				await save();
			})
		);
	new Setting(containerEl)
		.setName("Skip if icon already set")
		.addToggle((t) =>
			t.setValue(iz.skipIfIconPresent).onChange(async (v) => {
				plugin.settings.iconize.skipIfIconPresent = v;
				await save();
			})
		);
	new Setting(containerEl)
		.setName("Icon front matter field")
		.addText((tx) => {
			tx.setValue(iz.iconField);
			tx.onChange(async (v) => {
				plugin.settings.iconize.iconField = v || "icon";
				await save();
			});
		});
	new Setting(containerEl)
		.setName("New / renamed folders")
		.addToggle((t) =>
			t.setValue(iz.newAndRename).onChange(async (v) => {
				plugin.settings.iconize.newAndRename = v;
				await save();
			})
		);
	new Setting(containerEl)
		.setName("Retro")
		.addToggle((t) =>
			t.setValue(iz.retro).onChange(async (v) => {
				plugin.settings.iconize.retro = v;
				await save();
				if (v) {
					void startIconRetro(plugin, true);
				} else {
					plugin.iconizeRetro.halt();
				}
			})
		);
	new Setting(containerEl)
		.setName("Iconize retro / minute")
		.addSlider((s) => {
			s.setLimits(1, 120, 1);
			s.setValue(iz.retroPerMinute);
			s.setInstant(false);
			s.setDynamicTooltip();
			s.onChange(async (v) => {
				plugin.settings.iconize.retroPerMinute = v;
				await save();
				plugin.iconizeRetro.restartTimer();
			});
		});

	/* —— Pixel Banner —— */
	containerEl.createEl("h3", { text: "Auto–Pixel Banner" });
	containerEl.createEl("p", {
		cls: "setting-item-description",
		text: "Uses placeholder images from picsum.photos (URLs in front matter). Pixel Banner reads the `banner` field (or the name you set here).",
	});
	const px = plugin.settings.pixelBanner;
	new Setting(containerEl)
		.setName("Enable Pixel Banner automation")
		.addToggle((t) =>
			t.setValue(px.enabled).onChange(async (v) => {
				plugin.settings.pixelBanner.enabled = v;
				await save();
			})
		);
	new Setting(containerEl)
		.setName("Banner front matter field")
		.addText((tx) => {
			tx.setValue(px.bannerField);
			tx.onChange(async (v) => {
				plugin.settings.pixelBanner.bannerField = v || "banner";
				await save();
			});
		});
	new Setting(containerEl)
		.setName("New notes: set banner URL")
		.setDesc("First Picsum candidate when a new .md is created without a banner.")
		.addToggle((t) =>
			t.setValue(px.newNotes).onChange(async (v) => {
				plugin.settings.pixelBanner.newNotes = v;
				await save();
			})
		);
	new Setting(containerEl)
		.setName("Ignore note title for random seed")
		.addToggle((t) =>
			t.setValue(px.ignoreTitleForSeed).onChange(async (v) => {
				plugin.settings.pixelBanner.ignoreTitleForSeed = v;
				await save();
			})
		);
	new Setting(containerEl)
		.setName("Candidate count (command palette picker)")
		.addSlider((s) => {
			s.setLimits(1, 5, 1);
			s.setValue(px.candidateCount);
			s.setDynamicTooltip();
			s.onChange(async (v) => {
				plugin.settings.pixelBanner.candidateCount = v;
				await save();
			});
		});
	new Setting(containerEl)
		.setName("Retro (notes missing banner)")
		.addToggle((t) =>
			t.setValue(px.retro).onChange(async (v) => {
				plugin.settings.pixelBanner.retro = v;
				await save();
				if (v) {
					void startPixelRetro(plugin, true);
				} else {
					plugin.pixelRetro.halt();
				}
			})
		);
	new Setting(containerEl)
		.setName("Pixel retro / minute")
		.addSlider((s) => {
			s.setLimits(1, 120, 1);
			s.setValue(px.retroPerMinute);
			s.setInstant(false);
			s.setDynamicTooltip();
			s.onChange(async (v) => {
				plugin.settings.pixelBanner.retroPerMinute = v;
				await save();
				plugin.pixelRetro.restartTimer();
			});
		});

	/* —— Preset & Autosidia —— */
	containerEl.createEl("h3", { text: "Presets & Autosidia" });
	let importTa: TextAreaComponent | null = null;
	new Setting(containerEl)
		.setName("Copy settings as JSON")
		.setDesc("Full backup; edit keyword rules here if you use JSON.")
		.addButton((b) => {
			b.setButtonText("Copy to clipboard");
			b.onClick(async () => {
				const t = exportSettingsToJson(plugin.settings);
				try {
					await navigator.clipboard.writeText(t);
					new Notice("Autosidian: settings copied to clipboard.");
				} catch {
					new Notice("Autosidian: copy failed (permissions).");
				}
			});
		});
	new Setting(containerEl)
		.setName("Import JSON")
		.setDesc("Paste a preset (or partial settings) below, then Import.")
		.addTextArea((a) => {
			importTa = a;
			a.setPlaceholder("Paste JSON…");
			a.inputEl.rows = 6;
		});
	new Setting(containerEl)
		.setName("Apply import")
		.addButton((b) => {
			b.setButtonText("Import & merge");
			b.setWarning();
			b.onClick(async () => {
				try {
					const raw = importTa?.getValue().trim() ?? "";
					const partial = importPresetJson(raw || "{}");
					plugin.settings = mergeImportedIntoSettings(plugin.settings, partial);
					await save();
					new Notice("Autosidian: imported. Close and reopen this tab to see all values.");
				} catch (e) {
					new Notice("Autosidian: import failed — check JSON in the console.");
					console.error(e);
				}
			});
		});
	new Setting(containerEl)
		.setName("Autosidia registry base URL")
		.setDesc("Future: e.g. https://autosidia.example.com — /health is probed when you test.")
		.addText((tx) => {
			tx.setValue(plugin.settings.autosidia.registryBaseUrl);
			tx.onChange(async (v) => {
				plugin.settings.autosidia.registryBaseUrl = v;
				await save();
			});
		});
	new Setting(containerEl)
		.setName("Test Autosidia health")
		.addButton((b) => {
			b.setButtonText("Ping");
			b.onClick(() => {
				void AutosidiaClient.pingAndNotify(plugin.settings.autosidia.registryBaseUrl, plugin.settings);
			});
		});
}
