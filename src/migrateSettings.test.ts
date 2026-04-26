import { describe, it, expect } from "vitest";
import { migrateSettings } from "./migrateSettings";
import { DEFAULT_SETTINGS, type AutosidianSettings } from "./settings";

describe("migrateSettings", () => {
	it("returns defaults for empty / bad input", () => {
		const a = migrateSettings(null);
		const b = migrateSettings(undefined);
		const c = migrateSettings(42);
		expect(a.settingsVersion).toBe(4);
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

	it("bumps to settingsVersion 4", () => {
		expect(migrateSettings({ settingsVersion: 1 }).settingsVersion).toBe(4);
		expect(migrateSettings({ settingsVersion: 3 }).settingsVersion).toBe(4);
	});

	it("merges autoCover defaults for upgrades from v3 (no autoCover)", () => {
		const m = migrateSettings({ settingsVersion: 3 });
		expect(m.autoCover.coverField).toBe(DEFAULT_SETTINGS.autoCover.coverField);
		expect(m.autoCover.provider).toBe(DEFAULT_SETTINGS.autoCover.provider);
		expect(m.autoCover.enabled).toBe(false);
	});

	it("preserves user overrides on autoCover", () => {
		const m = migrateSettings({
			autoCover: { provider: "pexels", pexelsApiKey: "k", enabled: true },
		});
		expect(m.autoCover.provider).toBe("pexels");
		expect(m.autoCover.pexelsApiKey).toBe("k");
		expect(m.autoCover.enabled).toBe(true);
		expect(m.autoCover.coverField).toBe(DEFAULT_SETTINGS.autoCover.coverField);
	});

	it("merges defaultIcon for iconize", () => {
		const m = migrateSettings({});
		expect("defaultIcon" in m.iconize).toBe(true);
		expect(migrateSettings({ iconize: { defaultIcon: "⭐" } }).iconize.defaultIcon).toBe("⭐");
	});
});
