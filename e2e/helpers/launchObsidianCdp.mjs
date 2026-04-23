import { spawn } from "node:child_process";
import path from "node:path";
import http from "node:http";
import { createServer } from "node:net";
import puppeteer from "puppeteer-core";
import { killProcessOnTcpPort, openFixtureFileInObsidian } from "./obsidianUri.mjs";
import { E2E_VAULT, E2E_OPEN_VAULT_FILE, E2E_SHOULD_OPEN_VAULT_URI } from "./paths.mjs";

function getFreePort() {
	return new Promise((resolve, reject) => {
		const s = createServer();
		s.on("error", reject);
		s.listen(0, "127.0.0.1", () => {
			const a = s.address();
			if (a == null || typeof a === "string") {
				s.close();
				reject(new Error("could not get port"));
				return;
			}
			const p = a.port;
			s.close(() => resolve(p));
		});
	});
}

function getJsonVersionOk(httpBase) {
	return new Promise((res) => {
		const r = http.get(`${httpBase}/json/version`, (c) => {
			c.resume();
			res(c.statusCode === 200);
		});
		r.on("error", () => res(false));
	});
}

async function waitForCdp(httpBase, timeoutMs) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		if (await getJsonVersionOk(httpBase)) return;
		await new Promise((r) => setTimeout(r, 300));
	}
	throw new Error(`CDP not ready: ${httpBase}`);
}

/**
 * @param {string} executablePath
 * @returns {string | null} Path to `Something.app` on macOS, else `null`
 */
function macOSAppBundle(executablePath) {
	const i = executablePath.indexOf(".app/");
	if (i < 0) {
		return null;
	}
	return executablePath.slice(0, i + 4);
}

async function findWorkspacePage(browser) {
	const deadline = Date.now() + 90_000;
	while (Date.now() < deadline) {
		for (const p of await browser.pages()) {
			try {
				await p.waitForSelector(".workspace", { visible: true, timeout: 2_000 });
				return p;
			} catch {
				/* try next */
			}
		}
		await new Promise((r) => setTimeout(r, 400));
	}
	return (await browser.pages())[0] ?? null;
}

const vault = E2E_VAULT;
const cdp = "http://127.0.0.1";

/**
 * Spawns Obsidian with a random remote-debugging port and returns a Puppeteer connection.
 * On **macOS** we use `open -n -a "Obsidian.app" --args …` so a **new** instance is started with the
 * fixture vault (not the last-used vault in an already running app).
 * After CDP, we may call **`obsidian://open?path=…/\.obsidian/app.json`** only when that vault is
 * expected to be **registered** in Obsidian (see [E2E_SHOULD_OPEN_VAULT_URI](paths.mjs)); the bundled
 * `e2e/fixture-vault` is usually **not** registered, so the URI is skipped to avoid “vault not found”.
 * Cleanup uses `lsof` on the debug port (no `ChildProcess` for the `open` launcher).
 */
export async function launchObsidianWithCdp(executablePath) {
	const port = await getFreePort();
	const httpBase = `${cdp}:${port}`;

	const args = [path.resolve(vault), `--remote-debugging-port=${port}`, "--remote-allow-origins=*"];
	const appBundle = process.platform === "darwin" ? macOSAppBundle(executablePath) : null;

	/** @type {import('node:child_process').ChildProcess | null} */
	let child = null;

	if (appBundle) {
		child = spawn("open", ["-n", "-a", appBundle, "--args", ...args], {
			stdio: "ignore",
			detached: false,
		});
	} else {
		child = spawn(executablePath, args, { stdio: "ignore", detached: false, env: { ...process.env } });
	}

	if (child.pid == null) {
		throw new Error("spawn: no pid");
	}

	child.once("error", (e) => {
		console.error("launchObsidianWithCdp:", e);
	});

	// The `open` child exits right away; give the new process time to claim the port.
	if (appBundle) {
		await new Promise((r) => setTimeout(r, 800));
	}

	try {
		await waitForCdp(httpBase, 90_000);
	} catch (e) {
		if (appBundle) {
			killProcessOnTcpPort(port);
		} else {
			child.kill("SIGTERM");
		}
		throw e;
	}

	const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${port}` });
	if (E2E_SHOULD_OPEN_VAULT_URI) {
		openFixtureFileInObsidian(E2E_OPEN_VAULT_FILE);
		await new Promise((r) => setTimeout(r, 2_000));
	} else {
		await new Promise((r) => setTimeout(r, 800));
	}

	let page = await findWorkspacePage(browser);
	if (!page) {
		await browser.disconnect();
		if (appBundle) {
			killProcessOnTcpPort(port);
		} else {
			child.kill("SIGTERM");
		}
		throw new Error("No page with .workspace");
	}

	// The obsidian:// handler may have switched the active vault; re-pick a workspace page.
	const again = await findWorkspacePage(browser);
	if (again) {
		page = again;
	}
	return {
		page,
		/** @type {import('puppeteer-core').Browser} */
		browser,
		/** @type {() => Promise<void>} */
		close: async () => {
			try {
				await browser.disconnect();
			} finally {
				if (appBundle) {
					killProcessOnTcpPort(port);
				} else if (child) {
					child.kill("SIGTERM");
				}
			}
		},
	};
}
