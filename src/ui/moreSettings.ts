import { Notice, Setting, type TextAreaComponent } from "obsidian";
import type AutosidianPlugin from "../main";
import { startWaypointRetro } from "../waypoint/registerWaypointFeature";
import { restartIconizeRetroIfEnabled, startIconRetro } from "../iconize/registerIconizeFeature";
import { applyPixelBannerPexelsSearchPreset } from "../pixelBanner/pixelBannerApiPreset";
import { startPixelRetro } from "../pixelBanner/registerPixelBannerFeature";
import { startCoverRetro } from "../autoCover/registerAutoCoverFeature";
import type { CoverProvider } from "../settings";
import { AutosidiaClient } from "../autosidia/AutosidiaClient";
import { exportSettingsToJson, importPresetJson, mergeImportedIntoSettings } from "../presets/presetIO";
import { addIconizeRuleTableSection } from "./iconizeRuleTable";
import { addEmojiLookupTableSection } from "./emojiLookupTableSection";

export function addAutomationSettingsSections(containerEl: HTMLElement, plugin: AutosidianPlugin): void {
	const save = async () => {
		await plugin.saveSettings();
	};

	const saveIconize = async () => {
		await plugin.saveSettings();
		restartIconizeRetroIfEnabled(plugin);
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
	containerEl.createEl("p", {
		cls: "setting-item-description",
		text: `With waypoint retro on, the queue has about ${plugin.waypointRetro.getQueueLength()} folder note(s) still to process (while this tab is open; reopen to refresh). Use “Stop all background retro queues” below or the command palette to clear queues without changing toggles.`,
	});

	/* —— Iconize —— */
	containerEl.createEl("h3", { text: "Auto–Iconize" });
	const izWarn = containerEl.createEl("p", {
		cls: "setting-item-description mod-warning",
		text: "⚠️ Experimental and incomplete. Auto–Iconize may mis-match emojis, fail to sync with the Iconize plugin, or leave folder rows without icons. Review results before trusting on a large vault; keep backups.",
	});
	izWarn.style.color = "var(--text-warning)";
	izWarn.style.fontWeight = "600";
	containerEl.createEl("p", {
		cls: "setting-item-description",
		text: "Writes the `icon` field on **folder notes** and (optionally) tells Iconize to show the same icon on the **folder** row in the file explorer. In Iconize’s settings, turn on **front matter / properties** and use the **same field name** as below. **Set icon…** in Iconize only updates Iconize’s data file unless you enable *set front matter* there. **New / renamed folders** only runs on new/renamed folders; use **Retro** for existing vaults. **Diverse unmatched** adds a stable emoji when the name matches no keyword and default is empty.",
	});
	const iz = plugin.settings.iconize;
	new Setting(containerEl)
		.setName("Enable Auto–Iconize")
		.addToggle((t) =>
			t.setValue(iz.enabled).onChange(async (v) => {
				plugin.settings.iconize.enabled = v;
				await saveIconize();
			})
		);
	new Setting(containerEl)
		.setName("Skip if icon already set")
		.addToggle((t) =>
			t.setValue(iz.skipIfIconPresent).onChange(async (v) => {
				plugin.settings.iconize.skipIfIconPresent = v;
				await saveIconize();
			})
		);
	new Setting(containerEl)
		.setName("Icon front matter field")
		.addText((tx) => {
			tx.setValue(iz.iconField);
			tx.onChange(async (v) => {
				plugin.settings.iconize.iconField = v || "icon";
				await saveIconize();
			});
		});
	new Setting(containerEl)
		.setName("Default icon (if no keyword matches)")
		.setDesc(
			"Emoji or Iconize id (e.g. `IbBell` from Lucide / a pack). When set, it applies when no keyword matches. If **empty**, **Diverse emoji for unmatched names** (below) picks a stable emoji per folder name so every folder with a note can get an icon."
		)
		.addText((tx) => {
			tx.setPlaceholder("e.g. 📝 or IbBell");
			tx.setValue(iz.defaultIcon);
			tx.onChange(async (v) => {
				plugin.settings.iconize.defaultIcon = v;
				await saveIconize();
			});
		});
	new Setting(containerEl)
		.setName("Match most similar emoji (emojilib + synonyms)")
		.setDesc(
			"After your keyword table, score the **folder name** against the [emojilib](https://github.com/muan/emojilib) English keyword set (thousands of emojis) plus a built-in **synonym** list, then pick the best match. If nothing clears the quality threshold, your **default icon** (or **diverse**, if default is empty) is used. Turn off to rely on **rules + default + diverse** only."
		)
		.addToggle((t) =>
			t.setValue(iz.matchMostSimilarEmoji).onChange(async (v) => {
				plugin.settings.iconize.matchMostSimilarEmoji = v;
				await saveIconize();
			})
		);
	new Setting(containerEl)
		.setName("Diverse emoji for unmatched names")
		.setDesc(
			"When on: if the name matches **no** keyword and default icon is **empty**, still assign a stable emoji from a built-in list. Turn off to skip those folders (keyword + default only)."
		)
		.addToggle((t) =>
			t.setValue(iz.suggestDiverseUnmatched).onChange(async (v) => {
				plugin.settings.iconize.suggestDiverseUnmatched = v;
				await saveIconize();
			})
		);
	new Setting(containerEl)
		.setName("Show icon on folder row (Iconize API)")
		.setDesc(
			"After writing front matter, also register the icon on the **folder** path in Iconize so the file tree shows it next to the folder (not only the inner `FolderName/FolderName.md` line). Requires Iconize enabled."
		)
		.addToggle((t) =>
			t.setValue(iz.syncIconizeFolderRow).onChange(async (v) => {
				plugin.settings.iconize.syncIconizeFolderRow = v;
				await saveIconize();
			})
		);
	new Setting(containerEl)
		.setName("New / renamed folders")
		.addToggle((t) =>
			t.setValue(iz.newAndRename).onChange(async (v) => {
				plugin.settings.iconize.newAndRename = v;
				await saveIconize();
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
				restartIconizeRetroIfEnabled(plugin);
			});
		});
	addIconizeRuleTableSection(containerEl, plugin, saveIconize);
	addEmojiLookupTableSection(containerEl, plugin, saveIconize);

	/* —— Pixel Banner —— */
	containerEl.createEl("h3", { text: "Auto–Pixel Banner" });
	containerEl.createEl("p", {
		cls: "setting-item-description",
		text: "Writes **search keywords** (not direct image URLs) into front matter so Pixel Banner fetches images via its **3rd party APIs** tab (Pexels / etc.). Aligned with the `banner` field in Pixel Banner → Custom Fields.",
	});
	const px = plugin.settings.pixelBanner;
	new Setting(containerEl)
		.setName("Enable Pixel Banner API search in Pixel Banner settings")
		.setDesc(
			"One click: Pexels API key, API provider = Pexels, banner flag + pin + refresh for API images. Run once after installing Pixel Banner."
		)
		.addButton((b) => {
			b.setButtonText("Enable Pixel Banner API search (Pexels)…");
			b.setTooltip("Updates Pixel Banner plugin data (not Autosidian JSON).");
			b.onClick(() => {
				void applyPixelBannerPexelsSearchPreset(plugin.app).catch((e) => {
					console.error(e);
					new Notice("Autosidian: could not update Pixel Banner — see console.");
				});
			});
		});
	new Setting(containerEl)
		.setName("Enable Autosidian Pixel Banner automation")
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
		.setName("New notes: set `banner` to note title")
		.setDesc("When a new .md is created without a `banner` field, set it to the note title (file name) so Pixel Banner can search Pexels. Field name is configurable above.")
		.addToggle((t) =>
			t.setValue(px.newNotes).onChange(async (v) => {
				plugin.settings.pixelBanner.newNotes = v;
				await save();
			})
		);
	new Setting(containerEl)
		.setName("Ignore note title (use random keyword instead)")
		.setDesc("For new/retro auto-fill and the picker, use a generic keyword instead of the file name.")
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

	/* —— Auto–Cover —— */
	containerEl.createEl("h3", { text: "Auto–Cover" });
	containerEl.createEl("p", {
		cls: "setting-item-description",
		text: "Alternative to Auto–Pixel Banner that uses Obsidian's built-in `cover` property — no community plugin required. Performs a web image search per note (Wikipedia → Openverse, optionally Pexels) and writes the resulting image URL into front matter. Used by Bases card view (cover image) and Obsidian Publish previews.",
	});
	const cv = plugin.settings.autoCover;
	new Setting(containerEl)
		.setName("Enable Auto–Cover")
		.setDesc(
			"When on, new notes (toggle below) and Retro write a cover image URL to front matter. Disabled by default; turn on after picking the search provider you want."
		)
		.addToggle((t) =>
			t.setValue(cv.enabled).onChange(async (v) => {
				plugin.settings.autoCover.enabled = v;
				await save();
			})
		);
	new Setting(containerEl)
		.setName("Cover front matter field")
		.setDesc("Default: `cover` — Obsidian's built-in property used by Bases card view and Publish previews. Change only if you have a custom workflow.")
		.addText((tx) => {
			tx.setValue(cv.coverField);
			tx.onChange(async (v) => {
				plugin.settings.autoCover.coverField = v || "cover";
				await save();
			});
		});
	new Setting(containerEl)
		.setName("Image search provider")
		.setDesc(
			"`auto` tries Wikipedia (lead image for the topic) then Openverse (free CC search). Pexels requires an API key below; choose `pexels` to use it exclusively, or set the key and keep `auto` to use it as the last fallback."
		)
		.addDropdown((d) => {
			d.addOption("auto", "Auto (Wikipedia → Openverse → Pexels)");
			d.addOption("wikipedia", "Wikipedia (lead image only)");
			d.addOption("openverse", "Openverse (CC, no key)");
			d.addOption("pexels", "Pexels (requires API key)");
			d.setValue(cv.provider);
			d.onChange(async (v) => {
				plugin.settings.autoCover.provider = v as CoverProvider;
				await save();
			});
		});
	new Setting(containerEl)
		.setName("Pexels API key (optional)")
		.setDesc("Only sent when the provider is `pexels` or as the auto-fallback. Stored in plugin data; treat your vault's data file accordingly.")
		.addText((tx) => {
			tx.setPlaceholder("Pexels API key…");
			tx.setValue(cv.pexelsApiKey);
			tx.onChange(async (v) => {
				plugin.settings.autoCover.pexelsApiKey = v.trim();
				await save();
			});
		});
	new Setting(containerEl)
		.setName("New notes: search and set `cover` automatically")
		.setDesc("When a new .md is created without a `cover` field, run an image search for the note title and write the resulting URL.")
		.addToggle((t) =>
			t.setValue(cv.newNotes).onChange(async (v) => {
				plugin.settings.autoCover.newNotes = v;
				await save();
			})
		);
	new Setting(containerEl)
		.setName("Skip if `banner` already set (Pixel Banner)")
		.setDesc("Recommended when running both features so Pixel Banner notes keep their banner workflow and Auto–Cover handles only the rest.")
		.addToggle((t) =>
			t.setValue(cv.skipIfBannerPresent).onChange(async (v) => {
				plugin.settings.autoCover.skipIfBannerPresent = v;
				await save();
			})
		);
	new Setting(containerEl)
		.setName("Ignore note title (use random keyword instead)")
		.setDesc("For new/retro auto-fill and the picker, use a generic keyword instead of the file name.")
		.addToggle((t) =>
			t.setValue(cv.ignoreTitleForSeed).onChange(async (v) => {
				plugin.settings.autoCover.ignoreTitleForSeed = v;
				await save();
			})
		);
	new Setting(containerEl)
		.setName("Candidate count (command palette picker)")
		.addSlider((s) => {
			s.setLimits(1, 5, 1);
			s.setValue(cv.candidateCount);
			s.setDynamicTooltip();
			s.onChange(async (v) => {
				plugin.settings.autoCover.candidateCount = v;
				await save();
			});
		});
	new Setting(containerEl)
		.setName("Retro (notes missing `cover`)")
		.setDesc("Slow background pass that searches and writes covers for existing notes. Each pulse hits one image API; keep the rate modest.")
		.addToggle((t) =>
			t.setValue(cv.retro).onChange(async (v) => {
				plugin.settings.autoCover.retro = v;
				await save();
				if (v) {
					void startCoverRetro(plugin, true);
				} else {
					plugin.autoCoverRetro.halt();
				}
			})
		);
	new Setting(containerEl)
		.setName("Cover retro / minute")
		.setDesc("1–120; default 6 to be friendly to free image APIs.")
		.addSlider((s) => {
			s.setLimits(1, 120, 1);
			s.setValue(cv.retroPerMinute);
			s.setInstant(false);
			s.setDynamicTooltip();
			s.onChange(async (v) => {
				plugin.settings.autoCover.retroPerMinute = v;
				await save();
				plugin.autoCoverRetro.restartTimer();
			});
		});

	/* —— Queues (all five retro types) —— */
	containerEl.createEl("h3", { text: "Background retro queues" });
	containerEl.createEl("p", {
		cls: "setting-item-description",
		text: "Retro processors run on a timer. Stopping clears the pending queue for each feature without turning off the retro toggles (they will fill again on next refresh).",
	});
	new Setting(containerEl)
		.setName("Stop all background retro queues now")
		.setDesc("Same as the command: autosidian-stop-all-retro-queues.")
		.addButton((b) => {
			b.setButtonText("Stop all");
			b.setWarning();
			b.onClick(() => {
				const a = plugin.folderNotesRetro.getQueueLength();
				const w = plugin.waypointRetro.getQueueLength();
				const i = plugin.iconizeRetro.getQueueLength();
				const p = plugin.pixelRetro.getQueueLength();
				const c = plugin.autoCoverRetro.getQueueLength();
				plugin.folderNotesRetro.halt();
				plugin.waypointRetro.halt();
				plugin.iconizeRetro.halt();
				plugin.pixelRetro.halt();
				plugin.autoCoverRetro.halt();
				new Notice(
					`Autosidian: stopped retro queues (had ${a} + ${w} + ${i} + ${p} + ${c} item(s) pending, folder/waypoint/iconize/pixel/cover).`
				);
			});
		});

	/* —— Preset & Autosidia —— */
	containerEl.createEl("h3", { text: "Presets & Autosidia" });
	let importTa: TextAreaComponent | null = null;
	new Setting(containerEl)
		.setName("Copy settings as JSON")
		.setDesc("Full backup; bulk-edit rules, or use the icon rule table / merge import.")
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
					restartIconizeRetroIfEnabled(plugin);
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
