import { beforeEach, describe, expect, it } from "vitest";
import {
	_resetEmojiSimilarityCacheForTests,
	getEmojiLookupStats,
	searchEmojiLookupTable,
} from "./emojiSimilarity";

describe("emoji lookup table (settings / search)", () => {
	beforeEach(() => {
		_resetEmojiSimilarityCacheForTests();
	});

	it("getEmojiLookupStats returns positive counts", () => {
		const s = getEmojiLookupStats();
		expect(s.total).toBeGreaterThan(1000);
		expect(s.indexedTokens).toBeGreaterThan(100);
	});

	it("searchEmojiLookupTable empty query returns rows", () => {
		const rows = searchEmojiLookupTable("", 25);
		expect(rows.length).toBe(25);
		expect(rows[0]?.emoji.length).toBeGreaterThan(0);
	});

	it("searchEmojiLookupTable finds pizza-related emoji", () => {
		const rows = searchEmojiLookupTable("pizza", 20);
		expect(rows.length).toBeGreaterThan(0);
		const joined = rows.map((r) => r.emoji + r.keywordsSample).join(" ");
		expect(joined.toLowerCase()).toContain("pizza");
	});
});
