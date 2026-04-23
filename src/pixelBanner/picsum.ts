/** Deterministic placeholder images (no API key). */
export function picsumUrlsForTitle(title: string, count: number): string[] {
	const base = title.trim() || "autosidian";
	const out: string[] = [];
	for (let i = 0; i < count; i++) {
		const seed = `${base}-${i}`.replace(/[^a-zA-Z0-9-]/g, "");
		out.push(`https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/400`);
	}
	return out;
}
