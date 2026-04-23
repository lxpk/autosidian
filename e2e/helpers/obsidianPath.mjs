import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function getObsidianExecutablePath() {
	if (process.env.OBSIDIAN_PATH) {
		const p = process.env.OBSIDIAN_PATH;
		if (fs.existsSync(p)) return p;
		return null;
	}
	if (process.platform === "darwin") {
		const p = "/Applications/Obsidian.app/Contents/MacOS/Obsidian";
		if (fs.existsSync(p)) return p;
	}
	if (process.platform === "win32") {
		const la = process.env.LOCALAPPDATA;
		if (la) {
			const p = path.join(la, "Obsidian", "Obsidian.exe");
			if (fs.existsSync(p)) return p;
		}
	}
	if (process.platform === "linux") {
		const candidates = [
			path.join(os.homedir(), ".local/bin/obsidian"),
			"/usr/bin/obsidian",
			"/usr/local/bin/obsidian",
			"/opt/Obsidian/obsidian",
		];
		for (const c of candidates) {
			if (fs.existsSync(c)) return c;
		}
	}
	return null;
}

export function e2eShouldRun() {
	if (process.env.SKIP_E2E === "1" || process.env.SKIP_E2E === "true") {
		return false;
	}
	return getObsidianExecutablePath() != null;
}
