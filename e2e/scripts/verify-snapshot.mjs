#!/usr/bin/env node
/**
 * Verifies the E2E vault has a valid Autosidian install (CI-friendly, no Obsidian binary).
 * Uses the same `AUTOSIDIAN_E2E_VAULT` / default as sync-plugin.mjs.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { E2E_VAULT } from "../helpers/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginDir = path.join(E2E_VAULT, ".obsidian/plugins/autosidian");
const manifestPath = path.join(pluginDir, "manifest.json");
const mainPath = path.join(pluginDir, "main.js");

if (!fs.existsSync(manifestPath)) throw new Error(`verify: missing ${manifestPath}`);
if (!fs.existsSync(mainPath)) throw new Error(`verify: missing ${mainPath}`);

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.id !== "autosidian") {
	throw new Error(`verify: expected manifest.id "autosidian", got ${JSON.stringify(manifest.id)}`);
}
if (!manifest.minAppVersion) {
	throw new Error("verify: manifest should include minAppVersion");
}
console.log(`verify-snapshot: OK (plugin id=${manifest.id}, version=${manifest.version}, vault=${E2E_VAULT})`);
