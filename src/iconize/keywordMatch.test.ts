import { beforeEach, describe, it, expect } from "vitest";
import { customKeywordsToRules, pickIconForTitle, resolveIconForFolderName } from "./keywordMatch";
import { _resetEmojiSimilarityCacheForTests, findMostSimilarEmoji } from "./emojiSimilarity";
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

describe("resolveIconForFolderName", () => {
	const rules: IconizeRule[] = [{ keyword: "a", icon: "A" }];
	it("uses default when no keyword matches", () => {
		expect(resolveIconForFolderName("zz", rules, "D")).toBe("D");
	});
	it("keyword wins over default", () => {
		expect(resolveIconForFolderName("xax", rules, "D")).toBe("A");
	});
	it("no default and no match → null", () => {
		expect(resolveIconForFolderName("zz", rules, "")).toBeNull();
		expect(resolveIconForFolderName("zz", rules, "   ")).toBeNull();
	});
	it("suggestDiverse: emoji when no keyword and no default", () => {
		const r = resolveIconForFolderName("weird-xyz-123", rules, "", { suggestDiverse: true });
		expect(r).toBeTruthy();
		expect(r!.length).toBeGreaterThan(0);
	});
	it("suggestDiverse: stable for same name", () => {
		const a = resolveIconForFolderName("same-id", rules, "", { suggestDiverse: true });
		const b = resolveIconForFolderName("same-id", rules, "", { suggestDiverse: true });
		expect(a).toBe(b);
	});
});

describe("resolve + most similar (emojilib)", () => {
	beforeEach(() => {
		_resetEmojiSimilarityCacheForTests();
	});

	it("findMostSimilarEmoji: pizza in name returns an emoji", () => {
		expect(findMostSimilarEmoji("pizza-party")).toBeTruthy();
	});

	it("mostSimilar: lib match is used before default", () => {
		const withMost = resolveIconForFolderName("pizza", [], "🗑", { mostSimilar: true, suggestDiverse: false });
		expect(withMost).not.toBe("🗑");
		const noMost = resolveIconForFolderName("pizza", [], "🗑", { mostSimilar: false, suggestDiverse: false });
		expect(noMost).toBe("🗑");
	});
});

describe("customEmojiKeywords (per-emoji user overrides)", () => {
	beforeEach(() => {
		_resetEmojiSimilarityCacheForTests();
	});

	it("customKeywordsToRules flattens map and drops empties", () => {
		const flat = customKeywordsToRules({
			"🤖": ["robot", "ai", " ml ", ""],
			"📁": ["archive"],
			"": ["bogus"],
		});
		expect(flat).toEqual([
			{ keyword: "robot", icon: "🤖" },
			{ keyword: "ai", icon: "🤖" },
			{ keyword: "ml", icon: "🤖" },
			{ keyword: "archive", icon: "📁" },
		]);
	});

	it("pickIconForTitle: extra rules pick up matches the main rules miss", () => {
		const rules: IconizeRule[] = [{ keyword: "project", icon: "P" }];
		const extras = customKeywordsToRules({ "🤖": ["ai"] });
		expect(pickIconForTitle("ai-stuff", rules, extras)).toBe("🤖");
	});

	it("pickIconForTitle: main rules win on ties of equal length", () => {
		const rules: IconizeRule[] = [{ keyword: "ai", icon: "MAIN" }];
		const extras = customKeywordsToRules({ "🤖": ["ai"] });
		expect(pickIconForTitle("ai-stuff", rules, extras)).toBe("MAIN");
	});

	it("resolveIconForFolderName: customEmojiKeywords feed the longest-match pass", () => {
		const r = resolveIconForFolderName("ml-experiments", [], "📝", {
			customEmojiKeywords: { "🤖": ["ml"] },
		});
		expect(r).toBe("🤖");
	});

	it("findMostSimilarEmoji: user keyword boosts a specific emoji", () => {
		const without = findMostSimilarEmoji("widgetron-9000");
		const with_ = findMostSimilarEmoji("widgetron-9000", { "🦄": ["widgetron"] });
		expect(with_).toBe("🦄");
		expect(with_).not.toBe(without);
	});
});
