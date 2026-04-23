import { describe, it, expect } from "vitest";
import { pickIconForTitle } from "./keywordMatch";
import type { IconizeRule } from "../settings";

describe("pickIconForTitle", () => {
	const rules: IconizeRule[] = [
		{ keyword: "ab", icon: "A" },
		{ keyword: "a", icon: "B" },
		{ keyword: "project", icon: "P" },
	];
	it("picks longest match", () => {
		expect(pickIconForTitle("my project", rules)).toBe("P");
	});
	it("picks ab over a when both match", () => {
		expect(pickIconForTitle("xaby", rules)).toBe("A");
	});
	it("returns null if nothing matches", () => {
		expect(pickIconForTitle("zz", rules)).toBeNull();
	});
});
