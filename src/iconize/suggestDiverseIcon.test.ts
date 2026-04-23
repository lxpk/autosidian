import { describe, it, expect } from "vitest";
import { suggestDiverseIconForName } from "./suggestDiverseIcon";

describe("suggestDiverseIconForName", () => {
	it("returns an emoji and is stable for the same name", () => {
		expect(suggestDiverseIconForName("alpha")).toBe(suggestDiverseIconForName("alpha"));
	});
	it("is empty-safe", () => {
		const r = suggestDiverseIconForName("");
		expect(r.length).toBeGreaterThan(0);
	});
});
