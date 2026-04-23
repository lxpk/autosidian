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
};

export function iconizeResolveOptions(s: IconizeSettings): Partial<ResolveIconOptions> {
	return {
		mostSimilar: s.matchMostSimilarEmoji,
		suggestDiverse: s.suggestDiverseUnmatched,
	};
}

/** Longest `keyword` wins (case-insensitive). */
export function pickIconForTitle(title: string, rules: IconizeRule[]): string | null {
	const lower = title.toLowerCase();
	let best: { len: number; icon: string } | null = null;
	for (const r of rules) {
		if (!r.keyword) {
			continue;
		}
		const kw = r.keyword.toLowerCase();
		if (lower.includes(kw)) {
			if (!best || kw.length > best.len) {
				best = { len: kw.length, icon: r.icon };
			}
		}
	}
	return best ? best.icon : null;
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
	const picked = pickIconForTitle(title, rules);
	if (picked) {
		return picked;
	}
	if (options.mostSimilar) {
		const fromLib = findMostSimilarEmoji(title);
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
