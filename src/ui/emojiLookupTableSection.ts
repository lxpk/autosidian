import { Setting } from "obsidian";
import type AutosidianPlugin from "../main";
import { getSynonymLexiconPreview, synonymLexiconEntryCount } from "../iconize/synonymLexicon";
import { getEmojiLookupStats, searchEmojiLookupTable } from "../iconize/emojiSimilarity";

/**
 * Splits the user's free-text input into clean keyword tokens. Accepts comma- or whitespace-
 * separated input; lowercases and dedupes. Empty input → empty array (so we can drop the entry).
 */
function parseUserKeywordInput(raw: string): string[] {
	const parts = raw
		.toLowerCase()
		.split(/[,\n;]+/)
		.flatMap((p) => p.split(/\s+/))
		.map((p) => p.trim())
		.filter((p) => p.length > 0);
	const out: string[] = [];
	const seen = new Set<string>();
	for (const p of parts) {
		if (!seen.has(p)) {
			seen.add(p);
			out.push(p);
		}
	}
	return out;
}

/**
 * Renders the browsable emojilib + synonym reference under Auto–Iconize settings.
 *
 * Each row shows the emoji, its built-in emojilib English keywords, and a per-emoji **Your
 * keywords** input that the user can edit. Edits are saved to
 * [`iconize.customEmojiKeywords`](../settings.ts) and used by both keyword resolution and the
 * most-similar-emoji match.
 */
export function addEmojiLookupTableSection(
	containerEl: HTMLElement,
	plugin: AutosidianPlugin,
	save: () => Promise<void>
): void {
	containerEl.createEl("h4", { text: "Emoji & keyword lookup (built-in + your keywords)" });
	const stats = getEmojiLookupStats();
	containerEl.createEl("p", {
		cls: "setting-item-description",
		text: `Data comes from the bundled emojilib English keyword file (~${stats.total} emojis, ${stats.indexedTokens} index tokens) plus Autosidian’s synonym list. The third column lets you add **your own keywords** for any emoji — comma- or space-separated words that map directly to that emoji (longest match wins, same as the rules table) and also bias the “Match most similar emoji” lookup.`,
	});

	containerEl.createEl("h5", { text: "Synonym expansions (sample)" });
	const synWrap = containerEl.createDiv({ cls: "autosidian-emoji-synonym-wrap" });
	const synScroll = synWrap.createDiv({ cls: "autosidian-emoji-synonym-scroll" });
	const synTable = synScroll.createEl("table", { cls: "autosidian-icon-rules autosidian-emoji-synonym-table" });
	const shead = synTable.createEl("thead").createEl("tr");
	shead.createEl("th", { text: "Token" });
	shead.createEl("th", { text: "Also matches as…" });
	const sbody = synTable.createEl("tbody");
	for (const [k, vals] of getSynonymLexiconPreview(35)) {
		const tr = sbody.createEl("tr");
		tr.createEl("td").createEl("code", { text: k });
		tr.createEl("td", { text: vals.join(", ") });
	}
	synWrap.createEl("p", {
		cls: "setting-item-description",
		text: `${synonymLexiconEntryCount()} concept rows in src/iconize/synonymLexicon.ts (sample above).`,
	});

	const resultsHost = containerEl.createDiv({ cls: "autosidian-emoji-lookup-host" });
	let countLabel: HTMLParagraphElement | null = null;
	let searchDebounce: number | null = null;

	const setUserKeywords = (emoji: string, value: string): void => {
		const map = plugin.settings.iconize.customEmojiKeywords;
		const tokens = parseUserKeywordInput(value);
		if (tokens.length === 0) {
			delete map[emoji];
		} else {
			map[emoji] = tokens;
		}
		void save();
	};

	const render = (q: string): void => {
		resultsHost.empty();
		const rows = searchEmojiLookupTable(q, Number.POSITIVE_INFINITY);
		if (countLabel) {
			countLabel.setText(
				q
					? `${rows.length} match(es) for “${q}”.`
					: `Showing all ${rows.length} emojis. Use the search box to filter.`
			);
		}
		const wrap = resultsHost.createDiv({ cls: "autosidian-emoji-lookup-scroll" });
		const table = wrap.createEl("table", { cls: "autosidian-icon-rules autosidian-emoji-table" });
		const head = table.createEl("thead").createEl("tr");
		head.createEl("th", { text: "Emoji" });
		head.createEl("th", { text: "Built-in keywords" });
		head.createEl("th", { text: "Your keywords (comma-separated)" });
		const body = table.createEl("tbody");
		const userMap = plugin.settings.iconize.customEmojiKeywords;
		for (const r of rows) {
			const tr = body.createEl("tr");
			tr.createEl("td").createEl("span", { text: r.emoji, cls: "autosidian-emoji-cell" });
			tr.createEl("td", { text: r.keywordsSample, cls: "autosidian-emoji-kw" });
			const tdU = tr.createEl("td");
			const inU = tdU.createEl("input", { type: "text" });
			inU.addClass("autosidian-input");
			inU.placeholder = "add words…";
			const existing = userMap[r.emoji];
			inU.value = Array.isArray(existing) ? existing.join(", ") : "";
			inU.addEventListener("change", () => {
				setUserKeywords(r.emoji, inU.value);
			});
			inU.addEventListener("blur", () => {
				const tokens = parseUserKeywordInput(inU.value);
				inU.value = tokens.join(", ");
			});
		}
		if (rows.length === 0) {
			const tr = body.createEl("tr");
			const td = tr.createEl("td");
			td.colSpan = 3;
			td.setText("No matches — try another substring.");
		}
	};

	new Setting(containerEl)
		.setName("Search emoji / English keywords")
		.setDesc(
			"Filter the full table (substring match on index tokens or raw keywords). Leave empty to list all bundled emojis. Edits in the third column are saved automatically."
		)
		.addText((tx) => {
			tx.setPlaceholder("e.g. pizza, laptop, flight…");
			tx.onChange((v) => {
				if (searchDebounce !== null) {
					window.clearTimeout(searchDebounce);
				}
				searchDebounce = window.setTimeout(() => {
					searchDebounce = null;
					render(v);
				}, 120);
			});
		});

	countLabel = containerEl.createEl("p", {
		cls: "setting-item-description",
		text: "",
	});

	render("");
}
