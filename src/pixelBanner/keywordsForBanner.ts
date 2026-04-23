const FALLBACK_KEYWORDS = [
	"nature",
	"abstract",
	"landscape",
	"technology",
	"art",
	"cityscape",
	"ocean",
	"mountains",
] as const;

function pickKeyword(i: number): string {
	return FALLBACK_KEYWORDS[i % FALLBACK_KEYWORDS.length] ?? "nature";
}

function hashSeed(s: string): number {
	let h = 0;
	for (let i = 0; i < s.length; i++) {
		h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
	}
	return Math.abs(h);
}

/**
 * Value Autosidian writes to `banner` for new/retro automation: the note title (file basename),
 * or a deterministic keyword when “ignore title” is on — so Pixel Banner can Pexels-search it.
 */
export function noteTitleAsBannerKeyword(noteBasename: string, ignoreTitle: boolean): string {
	if (ignoreTitle) {
		return pickKeyword(hashSeed("ignore-title"));
	}
	const t = noteBasename.replace(/\.md$/i, "").trim();
	return t || pickKeyword(0);
}

/**
 * Yields Pexels search strings for the command-palette picker: title-based variants and alternates.
 * These are not URLs, so Pixel Banner uses its 3rd-party API (Pexels) to fetch images.
 */
export function keywordsForTitle(title: string, count: number, ignoreTitle: boolean): string[] {
	const n = Math.max(1, Math.min(5, Math.floor(count)));
	if (ignoreTitle) {
		const h = hashSeed("pick");
		const out: string[] = [];
		for (let i = 0; i < n; i++) {
			const a = pickKeyword(h + i);
			const b = pickKeyword(h + i * 3);
			out.push(i % 2 === 0 ? a : `${a}, ${b}`);
		}
		return out;
	}

	/* Prefer the note title as the first candidate, then variations. */
	const first = title.replace(/\.md$/i, "").trim() || pickKeyword(hashSeed("empty-title"));

	const words = first
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, " ")
		.split(/\s+/)
		.map((w) => w.replace(/^-+|-+$/g, ""))
		.filter((w) => w.length > 1);

	const main = words.length > 0 ? words.slice(0, 3).join(" ") : pickKeyword(hashSeed(first));

	/* [0] is always the note title; further rows are Pexels-style alternates. */
	const out: string[] = [first];
	let i = 1;
	while (out.length < n) {
		const extra = pickKeyword(hashSeed(first) + i);
		const line = i % 2 === 0 ? extra : `${main}, ${extra}`;
		if (!out.includes(line)) {
			out.push(line);
		}
		i++;
		if (i > 50) {
			break;
		}
	}
	return out;
}
