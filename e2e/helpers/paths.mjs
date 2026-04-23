import fs from "node:fs";
import path from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * When testing the plugin in the Obsidian app, use a vault named **autosidian** in iCloud.
 * On macOS, if this directory exists, it is the **default** E2E vault unless overridden (see [E2E_VAULT]).
 * @see [e2e/README.md](../README.md)
 */
export const ICLOUD_AUTOSIDIAN_VAULT_DARWIN = path.join(
	homedir(),
	"Library",
	"Mobile Documents",
	"iCloud~md~obsidian",
	"Documents",
	"autosidian"
);

const DEFAULT_E2E_VAULT = path.resolve(__dirname, "..", "fixture-vault");

/**
 * @param {string} p
 */
function resolvePathEnv(p) {
	if (p.startsWith("~/")) {
		return path.join(homedir(), p.slice(2));
	}
	return path.resolve(p);
}

function iCloudVaultExists() {
	if (process.platform !== "darwin") {
		return false;
	}
	try {
		return fs.existsSync(ICLOUD_AUTOSIDIAN_VAULT_DARWIN);
	} catch {
		return false;
	}
}

/**
 * @returns {string} Absolute path to the E2E vault: explicit env, or iCloud `autosidian` on macOS when
 *   present, else the repo’s [e2e/fixture-vault/](../fixture-vault/) (used on CI and when iCloud is absent).
 */
function resolveE2eVault() {
	if (process.env.AUTOSIDIAN_E2E_USE_FIXTURE === "1" || process.env.AUTOSIDIAN_E2E_USE_FIXTURE === "true") {
		return DEFAULT_E2E_VAULT;
	}
	const v = process.env.AUTOSIDIAN_E2E_VAULT?.trim();
	if (v) {
		return resolvePathEnv(v);
	}
	if (iCloudVaultExists()) {
		return ICLOUD_AUTOSIDIAN_VAULT_DARWIN;
	}
	return DEFAULT_E2E_VAULT;
}

/**
 * `npm run test:integration` / E2E: sync copies `main.js` / `manifest` / `styles.css` into this directory’s
 * `.obsidian/plugins/autosidian/`. Default on macOS: iCloud `autosidian` when that folder exists; else
 * [e2e/fixture-vault/](../fixture-vault/). Override with `AUTOSIDIAN_E2E_VAULT`, or set
 * `AUTOSIDIAN_E2E_USE_FIXTURE=1` to always use the bundled fixture.
 */
export const E2E_VAULT = resolveE2eVault();

const usesBundledFixture = path.resolve(E2E_VAULT) === path.resolve(DEFAULT_E2E_VAULT);

/**
 * `obsidian://open?path=…` only works for paths **inside a vault already registered** in Obsidian.
 * The bundled `e2e/fixture-vault` is often not in the vault list → “vault not found”. We enable the URI
 * when not using the bundled fixture (e.g. iCloud or `AUTOSIDIAN_E2E_VAULT`), or when
 * `AUTOSIDIAN_E2E_URI=1`. Set `AUTOSIDIAN_E2E_URI=0` to skip the URI.
 */
export const E2E_SHOULD_OPEN_VAULT_URI =
	process.env.AUTOSIDIAN_E2E_URI === "1" ||
	(!usesBundledFixture && process.env.AUTOSIDIAN_E2E_URI !== "0");

/**
 * File passed to `obsidian://open?path=…` when [E2E_SHOULD_OPEN_VAULT_URI](paths.mjs) is true. Every real vault has this.
 */
export const E2E_OPEN_VAULT_FILE = path.join(E2E_VAULT, ".obsidian", "app.json");
