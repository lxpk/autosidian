#!/usr/bin/env node
import fs from "fs";
import os from "os";
import path from "path";

/** Respects OBSIDIAN_PATH; otherwise common install locations per OS. */
export function resolveObsidianExecutable() {
	if (process.env.OBSIDIAN_PATH) {
		const p = process.env.OBSIDIAN_PATH;
		if (fs.existsSync(p)) return p;
		console.error(`OBSIDIAN_PATH is set but not found: ${p}`);
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
