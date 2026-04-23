/** Pixel Banner: field name in YAML (user may have customized in Pixel Banner; default matches docs). */
export const DEFAULT_BANNER_FIELD = "banner";

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
}

export interface PixelBannerSettings {
	enabled: boolean;
	/** front matter key for the banner image. */
	bannerField: string;
	/** Picsum seed / URL pattern — no third-party sign-up. */
	newNotes: boolean;
	retro: boolean;
	retroPerMinute: number;
	/** Picks per candidate list (1–5). */
	candidateCount: number;
	/** If true, use random Picsum image without keyword; else seed from first note line/title. */
	ignoreTitleForSeed: boolean;
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
	settingsVersion: 3,
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
	autosidia: {
		registryBaseUrl: "",
	},
};
