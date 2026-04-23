import path from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * When testing the plugin in the Obsidian app, use a vault named **autosidian** in iCloud.
 * (Pass `AUTOSIDIAN_E2E_VAULT` to point integration/E2E scripts at the same place.)
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

const hasCustomVaultEnv = Boolean(process.env.AUTOSIDIAN_E2E_VAULT?.trim());

/**
 * If set, `npm run test:integration` / E2E use this vault (sync copies `main.js` / manifest / `styles.css` here).
 * Recommended on macOS (see `ICLOUD_AUTOSIDIAN_VAULT_DARWIN`).
 * If unset, the repo’s `e2e/fixture-vault` is used (CI default).
 */
export const E2E_VAULT = hasCustomVaultEnv
	? resolvePathEnv(process.env.AUTOSIDIAN_E2E_VAULT)
	: DEFAULT_E2E_VAULT;

/**
 * `obsidian://open?path=…` only works for paths **inside a vault already registered** in Obsidian.
 * The bundled `e2e/fixture-vault` is often not in the vault list → “vault not found”. So we use the URI
 * when **`AUTOSIDIAN_E2E_VAULT` is set** (your iCloud `autosidian`, etc.) or when **`AUTOSIDIAN_E2E_URI=1`**
 * after you have opened that folder as a vault once. Set **`AUTOSIDIAN_E2E_URI=0`** to never send the URI.
 */
export const E2E_SHOULD_OPEN_VAULT_URI =
	process.env.AUTOSIDIAN_E2E_URI === "1" ||
	(hasCustomVaultEnv && process.env.AUTOSIDIAN_E2E_URI !== "0");

/**
 * File passed to `obsidian://open?path=…` when [E2E_SHOULD_OPEN_VAULT_URI](paths.mjs) is true. Every real vault has this.
 */
export const E2E_OPEN_VAULT_FILE = path.join(E2E_VAULT, ".obsidian", "app.json");
