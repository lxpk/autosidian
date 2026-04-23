/** True if `path` is the config folder or under it; skip vault automation. */
export function isUnderObsidianConfig(path: string): boolean {
	const p = path.replace(/\\/g, "/");
	return p === ".obsidian" || p.startsWith(".obsidian/");
}
