import type { App } from "obsidian";

/** Community plugin IDs as in each plugin’s `manifest.json` (not always the GitHub repo name). */
export const REQUIRED_PLUGINS = [
	{ id: "folder-notes", name: "Folder Notes" },
	{ id: "waypoint", name: "Waypoint" },
	{ id: "obsidian-icon-folder", name: "Iconize" },
	{ id: "pexels-banner", name: "Pixel Banner" },
] as const;

function getEnabledPluginIds(app: App): Set<string> {
	// `app.plugins` exists at runtime; Obsidian’s public `.d.ts` does not declare it on `App`.
	const p = (app as unknown as { plugins?: { enabledPlugins: Set<string> } }).plugins;
	return p?.enabledPlugins ?? new Set();
}

export function getMissingRequiredPlugins(app: App): { id: string; name: string }[] {
	const enabled = getEnabledPluginIds(app);
	const missing: { id: string; name: string }[] = [];
	for (const p of REQUIRED_PLUGINS) {
		if (!enabled.has(p.id)) {
			missing.push({ id: p.id, name: p.name });
		}
	}
	return missing;
}
