import { describe, it, expect } from "vitest";
import { keywordsForTitle, noteTitleAsBannerKeyword } from "./keywordsForBanner";

describe("noteTitleAsBannerKeyword", () => {
	it("uses the note title (basename) for Pexels search", () => {
		expect(noteTitleAsBannerKeyword("My Project", false)).toBe("My Project");
	});

	it("strips a mistaken .md suffix if present", () => {
		expect(noteTitleAsBannerKeyword("Note.md", false)).toBe("Note");
	});

	it("uses a fallback when ignore title is on", () => {
		expect(noteTitleAsBannerKeyword("X", true)).toBe(noteTitleAsBannerKeyword("Y", true));
	});
});

describe("keywordsForTitle", () => {
	it("returns n distinct lines without URLs; first is the note title", () => {
		const u = keywordsForTitle("Hello World", 3, false);
		expect(u).toHaveLength(3);
		expect(u[0]).toBe("Hello World");
		expect(u.join(" ")).not.toContain("http");
		expect(new Set(u).size).toBe(3);
	});

	it("ignores title when asked (picker only)", () => {
		const a = keywordsForTitle("ZZZ-unique-title-999", 2, true);
		const b = keywordsForTitle("Other", 2, true);
		expect(a[0]).toBe(b[0]);
	});
});
