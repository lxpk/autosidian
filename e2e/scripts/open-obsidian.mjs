#!/usr/bin/env node
/**
 * Brings the configured E2E vault to the front in the desktop app.
 * Uses `obsidian://` only when that vault is expected to be **registered** in Obsidian; for the
 * default bundled `e2e/fixture-vault`, we open the folder via `open -a` / the binary so you do not
 * get “vault not found” (see [paths.mjs](helpers/paths.mjs)).
 */
import { spawn } from "node:child_process";
import { openFixtureFileInObsidian } from "../helpers/obsidianUri.mjs";
import {
	E2E_OPEN_VAULT_FILE,
	E2E_SHOULD_OPEN_VAULT_URI,
	E2E_VAULT,
	ICLOUD_AUTOSIDIAN_VAULT_DARWIN,
} from "../helpers/paths.mjs";
import { resolveObsidianExecutable } from "./resolve-obsidian.mjs";

const exe = resolveObsidianExecutable();
if (!exe) {
	console.error("open-obsidian: could not find Obsidian. Set OBSIDIAN_PATH or install Obsidian.");
	process.exit(1);
}

if (E2E_SHOULD_OPEN_VAULT_URI) {
	console.log(
		`open-obsidian: obsidian://open?path=…\n  vault: ${E2E_VAULT}\n  file: ${E2E_OPEN_VAULT_FILE}`
	);
	if (process.platform === "darwin") {
		console.log(
			`  iCloud \`autosidian\` (typical): ${ICLOUD_AUTOSIDIAN_VAULT_DARWIN} — set AUTOSIDIAN_E2E_VAULT=… (and register that vault in Obsidian if needed).`
		);
	}
	openFixtureFileInObsidian(E2E_OPEN_VAULT_FILE);
} else {
	console.log(
		`open-obsidian: no obsidian:// (bundled fixture is often not in Obsidian’s vault list — set AUTOSIDIAN_E2E_VAULT to use a registered vault, or AUTOSIDIAN_E2E_URI=1 after adding the fixture as a vault).`
	);
	console.log(`  opening folder with Obsidian: ${E2E_VAULT}`);
	if (process.platform === "darwin") {
		const i = exe.indexOf(".app/");
		const bundle = i >= 0 ? exe.slice(0, i + 4) : null;
		if (bundle) {
			spawn("open", ["-a", bundle, E2E_VAULT], { detached: true, stdio: "ignore" }).unref();
		} else {
			spawn(exe, [E2E_VAULT], { detached: true, stdio: "ignore" }).unref();
		}
	} else {
		spawn(exe, [E2E_VAULT], { detached: true, stdio: "ignore" }).unref();
	}
}
