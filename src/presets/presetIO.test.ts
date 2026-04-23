import { describe, it, expect } from "vitest";
import { exportSettingsToJson, importPresetJson, mergeImportedIntoSettings } from "./presetIO";
import { DEFAULT_SETTINGS, type AutosidianSettings } from "../settings";
import { migrateSettings } from "../migrateSettings";

const sample: AutosidianSettings = migrateSettings({});

describe("presetIO", () => {
	it("export then import round-trip (wrapped schema)", () => {
		const j = exportSettingsToJson({ ...sample, waypoint: { ...sample.waypoint, retro: true } });
		const raw = importPresetJson(j);
		const merged = mergeImportedIntoSettings(sample, raw);
		expect(merged.waypoint.retro).toBe(true);
		expect(merged.settingsVersion).toBe(3);
	});

	it("import raw partial object (no schema)", () => {
		const p = { pixelBanner: { newNotes: true } } as Partial<AutosidianSettings>;
		const merged = mergeImportedIntoSettings(sample, p);
		expect(merged.pixelBanner.newNotes).toBe(true);
	});

	it("import keeps current iconize rules if imported rules array empty", () => {
		const m = mergeImportedIntoSettings(sample, { iconize: { rules: [] } });
		expect(m.iconize.rules).toEqual(sample.iconize.rules);
	});
});
