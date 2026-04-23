import { DEFAULT_SETTINGS, type AutosidianSettings } from "./settings";

/** Merge persisted data with defaults. After load, `settingsVersion` is 3. */
export function migrateSettings(loaded: unknown): AutosidianSettings {
	const raw = loaded && typeof loaded === "object" ? (loaded as Partial<AutosidianSettings>) : {};
	const merged: AutosidianSettings = {
		...DEFAULT_SETTINGS,
		...raw,
		settingsVersion: 3,
		folderNotes: { ...DEFAULT_SETTINGS.folderNotes, ...raw.folderNotes },
		waypoint: { ...DEFAULT_SETTINGS.waypoint, ...raw.waypoint },
		iconize: {
			...DEFAULT_SETTINGS.iconize,
			...raw.iconize,
			rules:
				raw.iconize?.rules && raw.iconize.rules.length > 0
					? raw.iconize.rules
					: DEFAULT_SETTINGS.iconize.rules,
		},
		pixelBanner: { ...DEFAULT_SETTINGS.pixelBanner, ...raw.pixelBanner },
		autosidia: { ...DEFAULT_SETTINGS.autosidia, ...raw.autosidia },
	};
	return merged;
}
