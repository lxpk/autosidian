/**
 * End-to-end UI check: open Settings → Autosidian and look for the required-plugin notice.
 * Run via `npm run test:e2e` (or `node e2e/spec/autosidian-settings.mjs` after `npm run test:integration`).
 */
import { launchObsidianWithCdp } from "../helpers/launchObsidianCdp.mjs";
import { e2eShouldRun, getObsidianExecutablePath } from "../helpers/obsidianPath.mjs";

/**
 * Settings may open in the same window or a new Electron window; find the one with the modal.
 * @param {import('puppeteer-core').Browser} browser
 * @param {import('puppeteer-core').Page} fallback
 */
async function getSettingsPage(browser, fallback) {
	const end = Date.now() + 12_000;
	while (Date.now() < end) {
		for (const p of await browser.pages()) {
			const m = await p.$(
				".mod-settings, .settings-modal, .modal.mod-settings, .modal-container, .mod-vertical"
			);
			if (m) {
				return p;
			}
		}
		await new Promise((r) => setTimeout(r, 300));
	}
	return fallback;
}

/**
 * @param {import('puppeteer-core').Page} page
 */
async function openAutosidianSettingsTab(page) {
	// Filter settings (Obsidian 1.4+)
	const search = await page.$('input[type="search"], .setting-search-input, input[placeholder*="Search" i]');
	if (search) {
		await search.focus();
		await page.evaluate((el) => {
			/** @type {HTMLInputElement} */ (el).value = "";
		}, search);
		await page.keyboard.type("Autosidian", { delay: 5 });
		await new Promise((r) => setTimeout(r, 600));
	}

	// Open Community plugins, then the Autosidian entry (English UI)
	await page.evaluate(() => {
		const t = (s) => s?.replace(/\s+/g, " ").trim() ?? "";
		for (const el of document.querySelectorAll(
			".vertical-tab-nav-item, .vertical-tab-header-group, .clickable-item, a, button, [role='tab']"
		)) {
			if (t(el.textContent) === "Community plugins" || t(el.textContent).startsWith("Community plugins")) {
				(el).click();
				return;
			}
		}
	});
	await new Promise((r) => setTimeout(r, 500));

	await page.evaluate(() => {
		for (const el of document.querySelectorAll(".vertical-tab-nav-item, a, button, [data-plugin-id]")) {
			if (el.textContent?.trim() === "Autosidian") {
				(el).click();
				return true;
			}
		}
		return false;
	});
}

async function run() {
	if (!e2eShouldRun()) {
		console.log("skip: Obsidian not found (set OBSIDIAN_PATH) or SKIP_E2E=1");
		process.exit(0);
	}
	const executablePath = getObsidianExecutablePath();
	if (!executablePath) {
		console.log("skip: no Obsidian binary");
		process.exit(0);
	}

	const { page, browser, close } = await launchObsidianWithCdp(executablePath);
	try {
		const title = await page.title();
		if (!/fixture-vault|e2e|autosidian/i.test(title)) {
			console.warn(
				`E2E: window title does not look like the fixture vault: "${title}". ` +
					"If the test fails, enable command-line/CLI in Obsidian and quit other windows."
			);
		}

		await page.keyboard.press("Escape").catch(() => {});

		const mod = process.platform === "darwin" ? "Meta" : "Control";
		await page.bringToFront();
		await page.keyboard.down(mod);
		await page.keyboard.press("Comma");
		await page.keyboard.up(mod);

		const settingsPage = await getSettingsPage(browser, page);
		await settingsPage.bringToFront();
		await settingsPage.waitForSelector(
			".mod-settings, .modal-container, .modal, .mod-vertical, .settings-module-container",
			{ timeout: 45_000 }
		);

		await openAutosidianSettingsTab(settingsPage);

		// [AutosidianSettingTab] — missing-deps banner OR "all required plugins enabled" (ok line)
		try {
			await settingsPage.waitForSelector(".autosidian-settings-notice, .autosidian-ok", { timeout: 45_000 });
		} catch (e) {
			const snippet = await settingsPage
				.evaluate(() => (document.body ? document.body.innerText.slice(0, 2_000) : ""))
				.catch(() => "(could not read DOM)");
			throw new Error(
				"Did not find .autosidian-settings-notice or .autosidian-ok. Is the Autosidian settings tab open? " +
					"Body snippet (first 2k): " +
					snippet +
					" — Original: " +
					(e && e.message)
			);
		}
		console.log("E2E: Autosidian settings tab OK (plugin notice or all-deps-ok).");
	} finally {
		await close();
	}
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
