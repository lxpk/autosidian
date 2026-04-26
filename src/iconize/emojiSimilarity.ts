import emojiData from "emojilib/dist/emoji-en-US.json";
import { expandQueryTokens, STOP_TOKENS } from "./synonymLexicon";

type EmojiLibJson = Record<string, string[]>;

const data = emojiData as EmojiLibJson;

/** Emojis whose keyword lists are over-specific for folder names. */
const OVERCOMMON_TOKEN_IGNORE = new Set([
	"face",
	"man",
	"woman",
	"person",
	"with",
	"and",
	"the",
	"in",
	"on",
	"of",
	"to",
	"for",
]);

function tokenizeRawKeyword(phrase: string): string[] {
	return phrase
		.toLowerCase()
		.replace(/_/g, " ")
		.split(/[^a-z0-9]+/)
		.filter((t) => t.length >= 2 && !STOP_TOKENS.has(t) && !OVERCOMMON_TOKEN_IGNORE.has(t));
}

function isEditDistanceAtMostOne(a: string, b: string): boolean {
	if (a === b) {
		return true;
	}
	const la = a.length;
	const lb = b.length;
	if (la > lb + 1 || lb > la + 1) {
		return false;
	}
	if (la === lb) {
		let diff = 0;
		for (let i = 0; i < la; i++) {
			if (a[i] !== b[i]) {
				diff++;
			}
		}
		return diff <= 1;
	}
	const s = la > lb ? a : b;
	const t = la > lb ? b : a;
	let i = 0;
	let j = 0;
	let skip = 0;
	while (i < s.length && j < t.length) {
		if (s[i] === t[j]) {
			i++;
			j++;
		} else {
			i++;
			if (++skip > 1) {
				return false;
			}
		}
	}
	return true;
}

type Prepared = {
	/** index token -> emojis that list that token in keywords */
	inverted: Map<string, Set<string>>;
	/** document frequency: token -> number of emojis with that token */
	df: Map<string, number>;
	/** all distinct index keys for fuzzy (prefix-bucket) */
	keysByFirst: Map<string, string[]>;
	totalEmojis: number;
	avgIdf: number;
};

let prepared: Prepared | null = null;

function getPrepared(): Prepared {
	if (prepared) {
		return prepared;
	}
	const inverted = new Map<string, Set<string>>();
	const df = new Map<string, number>();
	const emojiList = Object.keys(data);
	const n = emojiList.length;
	const firstSeen = new Map<string, Set<string>>();

	for (const em of emojiList) {
		const seenThisEmoji = new Set<string>();
		const kws = data[em];
		if (!kws) {
			continue;
		}
		for (const phrase of kws) {
			for (const t of tokenizeRawKeyword(phrase)) {
				if (!seenThisEmoji.has(t)) {
					seenThisEmoji.add(t);
					if (!inverted.has(t)) {
						inverted.set(t, new Set());
					}
					inverted.get(t)!.add(em);
					df.set(t, (df.get(t) ?? 0) + 1);
				}
			}
		}
	}

	let sumIdf = 0;
	let count = 0;
	for (const t of df.keys()) {
		const dfi = df.get(t) ?? 1;
		const idf = Math.log(1 + n / (dfi + 0.5));
		sumIdf += idf;
		count++;
	}
	const avgIdf = count > 0 ? sumIdf / count : 1;

	const keysByFirst = new Map<string, string[]>();
	for (const t of inverted.keys()) {
		const c = t[0] ?? "a";
		if (!keysByFirst.has(c)) {
			keysByFirst.set(c, []);
		}
		keysByFirst.get(c)!.push(t);
	}
	for (const arr of keysByFirst.values()) {
		arr.sort();
	}

	prepared = { inverted, df, keysByFirst, totalEmojis: n, avgIdf };
	return prepared;
}

function idfForToken(t: string, p: Prepared): number {
	const d = p.df.get(t) ?? 0;
	if (d === 0) {
		return 0;
	}
	return Math.log(1 + p.totalEmojis / (d + 0.5));
}

function tokenizeTitle(name: string): string[] {
	return name
		.toLowerCase()
		.replace(/[''`]+/g, "")
		.split(/[^a-z0-9]+/)
		.filter((t) => t.length >= 2 && !STOP_TOKENS.has(t));
}

/**
 * Picks the best-matching emoji from the **emojilib** English set (~all named Unicode emojis in the
 * library) using keyword overlap, IDF weighting, optional 1-edit fuzzy match, and
 * [synonymLexicon](synonymLexicon.ts) expansions.
 *
 * `customEmojiKeywords` (per-emoji user overrides) gives a strong score boost when any user
 * keyword token matches a query token (after the same expansion pass), so users can steer the
 * lookup toward a specific emoji without fully replacing the emojilib index.
 */
export function findMostSimilarEmoji(
	title: string,
	customEmojiKeywords?: Record<string, string[]>
): string | null {
	const raw = tokenizeTitle(title);
	if (raw.length === 0) {
		return null;
	}
	const queryTokens = expandQueryTokens(raw);
	if (queryTokens.length === 0) {
		return null;
	}
	const p = getPrepared();
	const scores = new Map<string, number>();
	const FUZZY_F = 0.55;

	for (const q of queryTokens) {
		const w = idfForToken(q, p);
		if (w <= 0) {
			continue;
		}
		const hit = p.inverted.get(q);
		if (hit) {
			for (const e of hit) {
				scores.set(e, (scores.get(e) ?? 0) + w);
			}
		}
		if (q.length >= 4) {
			const c = q[0] ?? "";
			const candidates = p.keysByFirst.get(c) ?? [];
			for (const k of candidates) {
				if (k === q) {
					continue;
				}
				if (Math.abs(k.length - q.length) > 1) {
					continue;
				}
				if (isEditDistanceAtMostOne(q, k)) {
					const w2 = idfForToken(k, p) * FUZZY_F;
					const set = p.inverted.get(k);
					if (set) {
						for (const e of set) {
							scores.set(e, (scores.get(e) ?? 0) + w2);
						}
					}
				}
			}
		}
	}

	if (customEmojiKeywords) {
		const queryTokenSet = new Set(queryTokens);
		const CUSTOM_BOOST = p.avgIdf * 2.5;
		for (const [emoji, words] of Object.entries(customEmojiKeywords)) {
			if (!emoji || !Array.isArray(words) || words.length === 0) {
				continue;
			}
			let matched = 0;
			for (const phrase of words) {
				for (const t of tokenizeRawKeyword(phrase)) {
					if (queryTokenSet.has(t)) {
						matched++;
					}
				}
			}
			if (matched > 0) {
				scores.set(emoji, (scores.get(emoji) ?? 0) + CUSTOM_BOOST * matched);
			}
		}
	}

	let bestS = 0;
	for (const s of scores.values()) {
		if (s > bestS) {
			bestS = s;
		}
	}
	/** Tuned so random strings (no useful tokens) return null. */
	const MIN_SCORE = p.avgIdf * 0.42;
	if (bestS < MIN_SCORE) {
		return null;
	}
	/** Ties: deterministic pick (stable sort) so the same name always maps to the same emoji. */
	const winners = [...scores.entries()]
		.filter(([, s]) => s === bestS)
		.map(([e]) => e)
		.sort();
	return winners[0] ?? null;
}

/** For tests: reset cached index. */
export function _resetEmojiSimilarityCacheForTests(): void {
	prepared = null;
}

export type EmojiLookupRow = {
	emoji: string;
	keywordsSample: string;
};

export function getEmojiLookupStats(): { total: number; indexedTokens: number } {
	const p = getPrepared();
	return { total: p.totalEmojis, indexedTokens: p.inverted.size };
}

/**
 * Search the bundled emojilib keywords (substring on index tokens or joined keyword text).
 * Empty `query` returns the first `limit` emojis in stable sorted order for browsing.
 *
 * `limit` is clamped to the total number of indexed emojis (so callers can pass `Infinity`
 * to walk the whole library — used by the in-app emoji table when you want the full list).
 */
export function searchEmojiLookupTable(query: string, limit: number): EmojiLookupRow[] {
	const total = Object.keys(data).length;
	const requested = Number.isFinite(limit) ? Math.floor(limit) : total;
	const lim = Math.max(1, Math.min(total, requested));
	const q = query.trim().toLowerCase();
	const p = getPrepared();
	const seen = new Set<string>();
	const out: EmojiLookupRow[] = [];

	const pushEmoji = (em: string): void => {
		if (seen.has(em) || out.length >= lim) {
			return;
		}
		seen.add(em);
		const kws = data[em];
		const sample = (kws ?? []).slice(0, 12).join(", ");
		out.push({ emoji: em, keywordsSample: sample });
	};

	if (q.length < 2) {
		for (const em of Object.keys(data).sort()) {
			pushEmoji(em);
			if (out.length >= lim) {
				return out;
			}
		}
		return out;
	}

	for (const token of p.inverted.keys()) {
		if (token.includes(q)) {
			for (const em of p.inverted.get(token) ?? []) {
				pushEmoji(em);
				if (out.length >= lim) {
					return out;
				}
			}
		}
	}

	for (const [em, kws] of Object.entries(data)) {
		if (seen.has(em)) {
			continue;
		}
		const hay = kws.join(" ").toLowerCase();
		if (hay.includes(q)) {
			pushEmoji(em);
			if (out.length >= lim) {
				return out;
			}
		}
	}
	return out;
}
