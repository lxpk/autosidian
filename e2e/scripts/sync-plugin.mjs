#!/usr/bin/env node
/**
 * Copies built plugin artifacts into the E2E vault.
 * Run after `npm run build` (main.js must exist at repo root).
 * Target vault: `e2e/fixture-vault` by default, or `AUTOSIDIAN_E2E_VAULT` (see e2e/helpers/paths.mjs).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { E2E_VAULT } from "../helpers/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const destDir = path.join(E2E_VAULT, ".obsidian/plugins/autosidian");

const files = ["main.js", "manifest.json", "styles.css"];

fs.mkdirSync(destDir, { recursive: true });
for (const f of files) {
	const src = path.join(root, f);
	const dst = path.join(destDir, f);
	if (!fs.existsSync(src)) {
		console.error(`sync-plugin: missing ${src} — run npm run build first`);
		process.exit(1);
	}
	fs.copyFileSync(src, dst);
}
console.log(`sync-plugin: copied ${files.join(", ")} → ${destDir}`);
