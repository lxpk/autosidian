import type { AutosidianSettings } from "../settings";
import { migrateSettings } from "../migrateSettings";

const PRESET_VERSION = 1;

export type AutosidianPresetV1 = {
	schema: "autosidian-preset";
	version: number;
	/** Subset of settings; merged with current defaults. */
	data: Partial<AutosidianSettings>;
};

export function exportSettingsToJson(settings: AutosidianSettings, pretty = true): string {
	const body: AutosidianPresetV1 = {
		schema: "autosidian-preset",
		version: PRESET_VERSION,
		data: { ...settings, settingsVersion: settings.settingsVersion },
	};
	return pretty ? JSON.stringify(body, null, 2) : JSON.stringify(body);
}

export function importPresetJson(json: string): Partial<AutosidianSettings> {
	const raw = JSON.parse(json) as unknown;
	if (raw && typeof raw === "object" && (raw as AutosidianPresetV1).schema === "autosidian-preset") {
		return (raw as AutosidianPresetV1).data;
	}
	// allow raw settings object
	if (raw && typeof raw === "object") {
		return raw as Partial<AutosidianSettings>;
	}
	return {};
}

export function mergeImportedIntoSettings(
	current: AutosidianSettings,
	imported: Partial<AutosidianSettings>
): AutosidianSettings {
	return migrateSettings({
		...current,
		...imported,
		folderNotes: { ...current.folderNotes, ...imported.folderNotes },
		waypoint: { ...current.waypoint, ...imported.waypoint },
		iconize: {
			...current.iconize,
			...imported.iconize,
			rules:
				imported.iconize?.rules && imported.iconize.rules.length > 0
					? imported.iconize.rules
					: current.iconize.rules,
		},
		pixelBanner: { ...current.pixelBanner, ...imported.pixelBanner },
		autoCover: { ...current.autoCover, ...imported.autoCover },
		autosidia: { ...current.autosidia, ...imported.autosidia },
	});
}
