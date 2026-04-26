/** Pixel Banner: field name in YAML (user may have customized in Pixel Banner; default matches docs). */
export const DEFAULT_BANNER_FIELD = "banner";

/** Obsidian built-in `cover` property; used by Bases Cards view and Publish previews. */
export const DEFAULT_COVER_FIELD = "cover";

/**
 * Image search backend for Auto–Cover.
 * - `auto`: try Wikipedia first (no key, page topic match), then Openverse (free).
 * - `wikipedia`: REST page summary `originalimage` / `thumbnail`.
 * - `openverse`: openverse.engineering image search (no key required).
 * - `pexels`: Pexels search; requires `pexelsApiKey`.
 */
export type CoverProvider = "auto" | "wikipedia" | "openverse" | "pexels";

export interface WaypointSettings {
	/** On new folder note file: insert %% Waypoint %% if the folder has subfolders. */
	newFolderNotes: boolean;
	/** When a new subfolder is created under a folder, refresh that folder’s folder note. */
	onChildFolderCreate: boolean;
	retro: boolean;
	retroPerMinute: number;
}

export interface IconizeRule {
	keyword: string;
	/** Emoji (grapheme) or Iconize icon name with prefix, e.g. `IbBell` */
	icon: string;
}

export interface IconizeSettings {
	enabled: boolean;
	/** If true, only set when no icon in front matter yet. */
	skipIfIconPresent: boolean;
	/** Front matter field Iconize reads (default `icon` in their docs). */
	iconField: string;
	/** New / renamed folder (folder note exists): apply. */
	newAndRename: boolean;
	retro: boolean;
	retroPerMinute: number;
	/** Longest match wins. */
	rules: IconizeRule[];
	/**
	 * If set (e.g. `📝`), used when the folder name matches **no** keyword, so every folder note
	 * can get an icon. Empty = use diverse suggestions (below) or keyword-only.
	 */
	defaultIcon: string;
	/**
	 * If true (and **Default icon** is empty), use a **stable** emoji from a built-in list so every
	 * folder name without a matching keyword still gets a distinct icon.
	 */
	suggestDiverseUnmatched: boolean;
	/**
	 * Call Iconize’s `addFolderIcon` on the **folder** path (not just front matter on the note).
	 * File explorer rows use the folder key; see [UI.md](UI.md) if icons only appear on the note line.
	 */
	syncIconizeFolderRow: boolean;
	/**
	 * When on: use **emojilib** (full project emoji + English keywords) plus built-in **synonym** expansions
	 * to pick the best-fitting emoji for the **folder name** (after your table rules, before default / diverse).
	 */
	matchMostSimilarEmoji: boolean;
	/**
	 * Per-emoji user keyword overrides edited in the in-app **Emoji & keyword lookup** table.
	 * Each entry maps a single grapheme emoji to extra English keywords (lowercased tokens).
	 *
	 * Used in **two** places at resolve time:
	 * 1. As additional longest-match keyword → icon rules (always on, even if `matchMostSimilarEmoji` is off).
	 * 2. As a strong score boost for the emojilib-based **most similar** match (only when `matchMostSimilarEmoji` is on).
	 *
	 * Empty values (after trim) and whole-empty arrays are dropped on save so the JSON stays small.
	 */
	customEmojiKeywords: Record<string, string[]>;
}

export interface PixelBannerSettings {
	enabled: boolean;
	/** front matter key for the banner image. */
	bannerField: string;
	/** New note: if `banner` is unset, set it to the note title for Pixel Banner Pexels keyword search. */
	newNotes: boolean;
	retro: boolean;
	retroPerMinute: number;
	/** Picks per candidate list (1–5). */
	candidateCount: number;
	/** If true, ignore the note title when picking default keywords. */
	ignoreTitleForSeed: boolean;
}

export interface AutoCoverSettings {
	enabled: boolean;
	/** Front matter key for the cover image (Obsidian built-in is `cover`). */
	coverField: string;
	/** Image search provider; `auto` tries free providers in order. */
	provider: CoverProvider;
	/** Pexels API key (only used when `provider === "pexels"`); blank by default. */
	pexelsApiKey: string;
	/** New note: when `cover` is unset, do an image search and write the URL. */
	newNotes: boolean;
	/** Retro: scan vault and fill missing covers at the configured rate. */
	retro: boolean;
	retroPerMinute: number;
	/** Picks per candidate list (1–5) for the picker. */
	candidateCount: number;
	/** If true, ignore the note title when picking default search keywords. */
	ignoreTitleForSeed: boolean;
	/**
	 * Skip notes whose `banner` (Pixel Banner) field is set; useful when running both features so
	 * Pixel Banner notes keep their banner workflow and Auto–Cover handles only the rest.
	 */
	skipIfBannerPresent: boolean;
}

export interface AutosidiaSettings {
	/** Base URL of Autosidia registry; empty = offline. */
	registryBaseUrl: string;
}

export interface FolderNotesSettings {
	newFolders: boolean;
	newNotes: boolean;
	retroactive: boolean;
	retroactivePerMinute: number;
}

export interface AutosidianSettings {
	settingsVersion: number;
	folderNotes: FolderNotesSettings;
	waypoint: WaypointSettings;
	iconize: IconizeSettings;
	pixelBanner: PixelBannerSettings;
	autoCover: AutoCoverSettings;
	autosidia: AutosidiaSettings;
}

const defaultIconizeRules: IconizeRule[] = [
	{ keyword: "project", icon: "📁" },
	{ keyword: "work", icon: "💼" },
	{ keyword: "book", icon: "📚" },
	{ keyword: "home", icon: "🏠" },
	{ keyword: "note", icon: "📝" },
	{ keyword: "meeting", icon: "📅" },
	{ keyword: "idea", icon: "💡" },
	{ keyword: "code", icon: "💻" },
	{ keyword: "task", icon: "✅" },
	{ keyword: "inbox", icon: "📥" },
];

export const DEFAULT_SETTINGS: AutosidianSettings = {
	settingsVersion: 4,
	folderNotes: {
		newFolders: false,
		newNotes: false,
		retroactive: false,
		retroactivePerMinute: 20,
	},
	waypoint: {
		newFolderNotes: true,
		onChildFolderCreate: true,
		retro: false,
		retroPerMinute: 30,
	},
	iconize: {
		enabled: true,
		skipIfIconPresent: true,
		iconField: "icon",
		newAndRename: true,
		retro: false,
		retroPerMinute: 20,
		rules: defaultIconizeRules,
		/** `📝` = icon on every folder note when Retro runs; clear to rely on diverse list / keywords only. */
		defaultIcon: "📝",
		suggestDiverseUnmatched: true,
		syncIconizeFolderRow: true,
		matchMostSimilarEmoji: true,
		customEmojiKeywords: {},
	},
	pixelBanner: {
		enabled: false,
		bannerField: DEFAULT_BANNER_FIELD,
		newNotes: false,
		retro: false,
		retroPerMinute: 10,
		candidateCount: 3,
		ignoreTitleForSeed: false,
	},
	autoCover: {
		enabled: false,
		coverField: DEFAULT_COVER_FIELD,
		provider: "auto",
		pexelsApiKey: "",
		newNotes: false,
		retro: false,
		retroPerMinute: 6,
		candidateCount: 3,
		ignoreTitleForSeed: false,
		skipIfBannerPresent: true,
	},
	autosidia: {
		registryBaseUrl: "",
	},
};
