import type { IconizeRule, IconizeSettings } from "../settings";
import { findMostSimilarEmoji } from "./emojiSimilarity";
import { suggestDiverseIconForName } from "./suggestDiverseIcon";

export type ResolveIconOptions = {
	/**
	 * If true: after custom rules, match folder name to [emojilib](https://github.com/muan/emojilib)
	 * English keywords (plus [synonymLexicon](synonymLexicon.ts)) before default/diverse.
	 */
	mostSimilar: boolean;
	/** If true and there is no keyword and no default icon, use a hash-based emoji. */
	suggestDiverse: boolean;
	/**
	 * Per-emoji user keyword overrides from the in-app emoji table. Treated as additional
	 * longest-match rules and as a score boost for the most-similar match (when on).
	 */
	customEmojiKeywords?: Record<string, string[]>;
};

export function iconizeResolveOptions(s: IconizeSettings): Partial<ResolveIconOptions> {
	return {
		mostSimilar: s.matchMostSimilarEmoji,
		suggestDiverse: s.suggestDiverseUnmatched,
		customEmojiKeywords: s.customEmojiKeywords,
	};
}

/** Flatten `customEmojiKeywords` into pseudo `(keyword → emoji)` rules. */
export function customKeywordsToRules(
	custom: Record<string, string[]> | undefined
): IconizeRule[] {
	if (!custom) {
		return [];
	}
	const out: IconizeRule[] = [];
	for (const [emoji, words] of Object.entries(custom)) {
		if (!emoji || !Array.isArray(words)) {
			continue;
		}
		for (const w of words) {
			const k = (w ?? "").trim();
			if (k) {
				out.push({ keyword: k, icon: emoji });
			}
		}
	}
	return out;
}

/**
 * Longest `keyword` wins (case-insensitive). Optional `extraRules` are matched alongside the main
 * `rules` array; the longest match across both lists wins. Pre-existing `rules` win on ties so
 * users can still override the auto-derived keywords from the emoji table.
 */
export function pickIconForTitle(
	title: string,
	rules: IconizeRule[],
	extraRules: IconizeRule[] = []
): string | null {
	const lower = title.toLowerCase();
	type Best = { len: number; icon: string; primary: boolean };
	const bestRef: { value: Best | null } = { value: null };
	const consider = (r: IconizeRule, primary: boolean): void => {
		if (!r.keyword) {
			return;
		}
		const kw = r.keyword.toLowerCase();
		if (!lower.includes(kw)) {
			return;
		}
		const cur = bestRef.value;
		if (!cur || kw.length > cur.len || (kw.length === cur.len && primary && !cur.primary)) {
			bestRef.value = { len: kw.length, icon: r.icon, primary };
		}
	};
	for (const r of rules) {
		consider(r, true);
	}
	for (const r of extraRules) {
		consider(r, false);
	}
	return bestRef.value ? bestRef.value.icon : null;
}

/**
 * Keyword match if any, else `defaultIcon` when non-empty (gives an icon on every folder note
 * that has a matchable rule or a fallback).
 */
export function resolveIconForFolderName(
	title: string,
	rules: IconizeRule[],
	defaultIcon: string | undefined,
	options: Partial<ResolveIconOptions> = {}
): string | null {
	const extra = customKeywordsToRules(options.customEmojiKeywords);
	const picked = pickIconForTitle(title, rules, extra);
	if (picked) {
		return picked;
	}
	if (options.mostSimilar) {
		const fromLib = findMostSimilarEmoji(title, options.customEmojiKeywords);
		if (fromLib) {
			return fromLib;
		}
	}
	const d = defaultIcon?.trim() ?? "";
	if (d.length > 0) {
		return d;
	}
	if (options.suggestDiverse) {
		return suggestDiverseIconForName(title);
	}
	return null;
}
