import type { IconizeRule } from "../settings";

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
