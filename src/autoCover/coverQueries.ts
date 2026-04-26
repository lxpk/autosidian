import { keywordsForTitle, noteTitleAsBannerKeyword } from "../pixelBanner/keywordsForBanner";

/**
 * Seed search query for new-note / retro automation: the note title (file basename),
 * or a deterministic fallback keyword when "ignore title" is on.
 *
 * Reuses Pixel Banner's keyword logic so users get consistent behavior across the two features.
 */
export function noteTitleAsCoverQuery(noteBasename: string, ignoreTitle: boolean): string {
	return noteTitleAsBannerKeyword(noteBasename, ignoreTitle);
}

/** Candidate search queries for the picker (1–5). */
export function coverQueryCandidates(
	title: string,
	count: number,
	ignoreTitle: boolean
): string[] {
	return keywordsForTitle(title, count, ignoreTitle);
}
