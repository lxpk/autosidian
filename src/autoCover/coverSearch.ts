import type { AutoCoverSettings, CoverProvider } from "../settings";

/**
 * One image hit from a search provider: an absolute HTTPS URL plus optional human-readable label.
 * The URL is what gets written to the note's `cover` front matter field.
 */
export interface CoverHit {
	url: string;
	source: CoverProvider;
	label?: string;
}

/** Minimal HTTP fetcher contract used by Auto–Cover so tests can inject a stub. */
export interface CoverHttp {
	get(args: { url: string; headers?: Record<string, string> }): Promise<{ status: number; text: string }>;
}

const WIKIPEDIA_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/";
const OPENVERSE_SEARCH = "https://api.openverse.engineering/v1/images/";
const PEXELS_SEARCH = "https://api.pexels.com/v1/search";

/** Return the first cover image URL for `query`, or `null` if none. */
export async function searchFirstCover(
	query: string,
	settings: AutoCoverSettings,
	http: CoverHttp
): Promise<CoverHit | null> {
	const list = await searchCoverCandidates(query, settings, 1, http);
	return list[0] ?? null;
}

/**
 * Return up to `limit` cover image hits for `query`. `provider === "auto"` tries Wikipedia
 * first, then Openverse (both keyless); Pexels is appended only when an API key is configured.
 */
export async function searchCoverCandidates(
	query: string,
	settings: AutoCoverSettings,
	limit: number,
	http: CoverHttp
): Promise<CoverHit[]> {
	const q = (query ?? "").trim();
	const n = Math.max(1, Math.min(10, Math.floor(limit)));
	if (!q) {
		return [];
	}
	const order = providersInOrder(settings);
	for (const p of order) {
		try {
			const hits = await searchOne(p, q, n, settings, http);
			if (hits.length > 0) {
				return hits;
			}
		} catch (e) {
			console.warn(`[Autosidian] Auto–Cover ${p} search failed:`, e);
		}
	}
	return [];
}

function providersInOrder(s: AutoCoverSettings): CoverProvider[] {
	if (s.provider !== "auto") {
		return [s.provider];
	}
	const keyless: CoverProvider[] = ["wikipedia", "openverse"];
	if (s.pexelsApiKey.trim()) {
		keyless.push("pexels");
	}
	return keyless;
}

async function searchOne(
	provider: CoverProvider,
	query: string,
	limit: number,
	settings: AutoCoverSettings,
	http: CoverHttp
): Promise<CoverHit[]> {
	if (provider === "wikipedia") {
		return wikipediaSearch(query, http);
	}
	if (provider === "openverse") {
		return openverseSearch(query, limit, http);
	}
	if (provider === "pexels") {
		return pexelsSearch(query, limit, settings.pexelsApiKey, http);
	}
	return [];
}

/** Wikipedia REST page summary returns `originalimage.source` for the topic's lead image. */
async function wikipediaSearch(query: string, http: CoverHttp): Promise<CoverHit[]> {
	const slug = encodeURIComponent(query.replace(/\s+/g, "_"));
	const url = `${WIKIPEDIA_SUMMARY}${slug}`;
	const r = await http.get({ url });
	if (r.status < 200 || r.status >= 300) {
		return [];
	}
	const j = safeJson(r.text);
	const orig = (j?.originalimage as { source?: string } | undefined)?.source;
	const thumb = (j?.thumbnail as { source?: string } | undefined)?.source;
	const src = (orig || thumb || "").trim();
	if (!src) {
		return [];
	}
	return [{ url: src, source: "wikipedia", label: String(j?.title ?? query) }];
}

/** Openverse free image search (CC-licensed); no API key required for read-only access. */
async function openverseSearch(query: string, limit: number, http: CoverHttp): Promise<CoverHit[]> {
	const url = `${OPENVERSE_SEARCH}?q=${encodeURIComponent(query)}&page_size=${limit}`;
	const r = await http.get({ url });
	if (r.status < 200 || r.status >= 300) {
		return [];
	}
	const j = safeJson(r.text);
	const items = Array.isArray(j?.results) ? j!.results : [];
	const hits: CoverHit[] = [];
	for (const it of items) {
		const u = String((it as { url?: string }).url ?? "").trim();
		if (u) {
			hits.push({
				url: u,
				source: "openverse",
				label: String((it as { title?: string }).title ?? query),
			});
		}
		if (hits.length >= limit) {
			break;
		}
	}
	return hits;
}

/** Pexels search; reads `Authorization: <apiKey>` per Pexels API docs. */
async function pexelsSearch(
	query: string,
	limit: number,
	apiKey: string,
	http: CoverHttp
): Promise<CoverHit[]> {
	const key = (apiKey ?? "").trim();
	if (!key) {
		return [];
	}
	const url = `${PEXELS_SEARCH}?query=${encodeURIComponent(query)}&per_page=${limit}`;
	const r = await http.get({ url, headers: { Authorization: key } });
	if (r.status < 200 || r.status >= 300) {
		return [];
	}
	const j = safeJson(r.text);
	const photos = Array.isArray(j?.photos) ? j!.photos : [];
	const hits: CoverHit[] = [];
	for (const p of photos) {
		const src = (p as { src?: { large?: string; medium?: string; original?: string } }).src;
		const u = (src?.large || src?.medium || src?.original || "").trim();
		if (u) {
			hits.push({
				url: u,
				source: "pexels",
				label: String((p as { alt?: string }).alt ?? query),
			});
		}
		if (hits.length >= limit) {
			break;
		}
	}
	return hits;
}

function safeJson(text: string): Record<string, unknown> | null {
	try {
		const v = JSON.parse(text) as unknown;
		return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
	} catch {
		return null;
	}
}
