import { describe, it, expect } from "vitest";
import { migrateSettings } from "./migrateSettings";
import { DEFAULT_SETTINGS, type AutosidianSettings } from "./settings";

describe("migrateSettings", () => {
	it("returns defaults for empty / bad input", () => {
		const a = migrateSettings(null);
		const b = migrateSettings(undefined);
		const c = migrateSettings(42);
		expect(a.settingsVersion).toBe(3);
		expect(b.waypoint.newFolderNotes).toBe(DEFAULT_SETTINGS.waypoint.newFolderNotes);
		expect(c.iconize.rules.length).toBeGreaterThan(0);
	});

	it("merges partial and keeps default iconize rules when rules missing or empty", () => {
		const p = { folderNotes: { newFolders: true } } as Partial<AutosidianSettings>;
		const m = migrateSettings(p);
		expect(m.folderNotes.newFolders).toBe(true);
		expect(m.folderNotes.newNotes).toBe(DEFAULT_SETTINGS.folderNotes.newNotes);
		expect(m.iconize.rules).toEqual(DEFAULT_SETTINGS.iconize.rules);
		const withEmpty = migrateSettings({ iconize: { rules: [] } });
		expect(withEmpty.iconize.rules.length).toBeGreaterThan(0);
		const withCustom = migrateSettings({ iconize: { rules: [{ keyword: "x", icon: "y" }] } });
		expect(withCustom.iconize.rules).toEqual([{ keyword: "x", icon: "y" }]);
	});

	it("bumps to settingsVersion 3", () => {
		expect(migrateSettings({ settingsVersion: 1 }).settingsVersion).toBe(3);
	});

	it("merges defaultIcon for iconize", () => {
		const m = migrateSettings({});
		expect("defaultIcon" in m.iconize).toBe(true);
		expect(migrateSettings({ iconize: { defaultIcon: "⭐" } }).iconize.defaultIcon).toBe("⭐");
	});
});
