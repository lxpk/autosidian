#!/usr/bin/env node
/**
 * Integration helper: add a `banner` front matter field (Pixel Banner keyword search) to every
 * folder note (`Parent/Parent.md`) that is missing it. Matches Autosidian auto–Pixel Banner:
 * banner value = note title (file basename without `.md`), for Pexels / built-in API search.
 *
 * Usage:
 *   node e2e/scripts/apply-pixel-banner-to-folder-notes.mjs           # dry-run (list only)
 *   node e2e/scripts/apply-pixel-banner-to-folder-notes.mjs --write   # write files
 *
 * Vault: [E2E_VAULT] from [e2e/helpers/paths.mjs](helpers/paths.mjs) (iCloud `autosidian` on macOS when present).
 *
 * Env: `AUTOSIDIAN_BANNER_FIELD` (default `banner`)
 */
import fs from "node:fs";
import path from "node:path";
import { E2E_VAULT } from "../helpers/paths.mjs";

const BANNER_FIELD = (process.env.AUTOSIDIAN_BANNER_FIELD || "banner").trim() || "banner";
const WRITE = process.argv.includes("--write");

/**
 * @param {string} vaultRoot
 * @returns {Generator<string>}
 */
function* walkFolderNotes(vaultRoot) {
	const obs = path.join(vaultRoot, ".obsidian");
	const stack = [vaultRoot];
	while (stack.length) {
		const dir = stack.pop();
		let names;
		try {
			names = fs.readdirSync(dir, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const ent of names) {
			if (ent.name === ".obsidian" || ent.name === ".trash" || ent.name === ".stfolder") {
				continue;
			}
			const p = path.join(dir, ent.name);
			if (ent.isDirectory()) {
				const notePath = path.join(p, `${ent.name}.md`);
				if (fs.existsSync(notePath) && fs.statSync(notePath).isFile()) {
					yield notePath;
				}
				stack.push(p);
			}
		}
	}
}

/**
 * @param {string} noteBasename e.g. "MyNote" (no .md)
 */
function bannerValueForFolderNoteTitle(noteBasename) {
	return noteBasename.replace(/\.md$/i, "").trim() || "note";
}

/**
 * @param {string} inner front matter without delimiters
 * @param {string} key
 * @returns {boolean} true if key has a non-empty value
 */
function hasNonEmptyBannerLine(inner, key) {
	const re = new RegExp(
		`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*(['"]?)(.*?)\\1\\s*$`,
		"im"
	);
	for (const line of inner.split(/\r?\n/)) {
		const m = line.match(re);
		if (m) {
			const v = m[2]?.trim() ?? "";
			if (v !== "" && v !== '""' && v !== "''") {
				return true;
			}
		}
	}
	return false;
}

/**
 * @param {string} fullText
 * @param {string} key
 * @param {string} value
 * @returns {{ next: string, changed: boolean }}
 */
function ensureBannerInMarkdown(fullText, key, value) {
	const hasDelim = /^---\r?\n/.test(fullText);
	if (!hasDelim) {
		return {
			next: `---\n${key}: ${value}\n---\n\n${fullText.replace(/^\uFEFF/, "")}`,
			changed: true,
		};
	}
	const m = fullText.match(/^---\r?\n([\s\S]*?)\r?\n---([\s\S]*)$/);
	if (!m) {
		return {
			next: `---\n${key}: ${value}\n---\n\n${fullText.replace(/^\uFEFF/, "")}`,
			changed: true,
		};
	}
	const inner = m[1];
	const rest = m[2] ?? "";
	if (hasNonEmptyBannerLine(inner, key)) {
		return { next: fullText, changed: false };
	}
	const lines = inner.split(/\r?\n/);
	const filtered = lines.filter((ln) => {
		const t = ln.trim();
		return !new RegExp(`^${key}\\s*:`).test(t);
	});
	const block = `${filtered.join("\n").replace(/\n$/, "")}${filtered.length ? "\n" : ""}${key}: ${value}\n`;
	return {
		next: `---\n${block}---` + (rest && rest.length > 0 ? rest : "\n"),
		changed: true,
	};
}

let vault = E2E_VAULT;
if (!fs.existsSync(vault) || !fs.statSync(vault).isDirectory()) {
	console.error(`apply-pixel-banner-to-folder-notes: E2E vault not found: ${vault}`);
	process.exit(1);
}

const notePaths = Array.from(walkFolderNotes(vault));
let nWould = 0;
let nSkip = 0;
const planned = [];

for (const notePath of notePaths) {
	const base = path.basename(notePath, ".md");
	const val = bannerValueForFolderNoteTitle(base);
	const raw = fs.readFileSync(notePath, "utf8");
	const { next, changed } = ensureBannerInMarkdown(raw, BANNER_FIELD, val);
	if (!changed) {
		nSkip++;
		continue;
	}
	nWould++;
	planned.push({ notePath, val });
	if (WRITE) {
		fs.writeFileSync(notePath, next, "utf8");
	}
}

const mode = WRITE ? "wrote" : "would add";
console.log(
	`apply-pixel-banner-to-folder-notes: vault ${vault}\n` +
		`  folder note files: ${notePaths.length}\n` +
		`  ${mode} ${BANNER_FIELD} on: ${nWould}\n` +
		`  already had ${BANNER_FIELD}: ${nSkip}`
);
for (const p of planned) {
	console.log(`  - ${path.relative(vault, p.notePath)} → ${BANNER_FIELD}: ${p.val}`);
}
if (!WRITE && nWould > 0) {
	console.log("  (dry-run; re-run with --write to apply)");
}
process.exit(0);
