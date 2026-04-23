import { Notice, type App } from "obsidian";

/** `manifest.json` `id` for Pixel Banner (community). */
export const PEXELS_BANNER_PLUGIN_ID = "pexels-banner";

/**
 * Pexels key applied when the user clicks "Enable Pixel Banner API search" in Autosidian settings.
 * Get your own key at https://www.pexels.com/api/ and replace the value in this file, or set it
 * in Pixel Banner settings after running the button once to enable the other toggles.
 */
const PRESET_PEXELS_API_KEY =
	"3hTb8tQoWyxmZgsyLCQrtvkyaebhopnCTMhwSmDAPckAhfGFAO23NsCX";

type PixelBannerPluginLike = {
	settings: Record<string, unknown>;
	saveSettings(): Promise<void> | void;
};

function getPixelBannerPlugin(app: App): PixelBannerPluginLike | null {
	const reg = (app as App & { plugins?: { getPlugin: (id: string) => unknown } }).plugins;
	const p = reg?.getPlugin?.(PEXELS_BANNER_PLUGIN_ID) as PixelBannerPluginLike | null | undefined;
	if (!p || typeof p.saveSettings !== "function" || !p.settings || typeof p.settings !== "object") {
		return null;
	}
	return p;
}

/**
 * Turns on Pixel Banner’s 3rd-party API workflow for Pexels: API provider, key, and
 * Pin / Refresh on API images so the built-in image search/refresh affordances are available.
 * Mutates the live plugin’s `settings` and saves (same as changing options in the Pixel Banner UI).
 */
export async function applyPixelBannerPexelsSearchPreset(app: App): Promise<void> {
	const pb = getPixelBannerPlugin(app);
	if (!pb) {
		new Notice("Install and enable the Pixel Banner community plugin, then try again.");
		return;
	}

	Object.assign(pb.settings, {
		pexelsApiKey: PRESET_PEXELS_API_KEY,
		apiProvider: "pexels",
		showSelectImageIcon: true,
		showRefreshIcon: true,
		showPinIcon: true,
	} satisfies Record<string, unknown>);

	await Promise.resolve(pb.saveSettings());
	new Notice("Pixel Banner: Pexels API, refresh & pin options enabled. Key saved in Pixel Banner data.");
}
