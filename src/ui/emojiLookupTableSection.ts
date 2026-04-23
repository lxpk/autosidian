import { Setting } from "obsidian";
import { getSynonymLexiconPreview, synonymLexiconEntryCount } from "../iconize/synonymLexicon";
import { getEmojiLookupStats, searchEmojiLookupTable } from "../iconize/emojiSimilarity";

/** Renders the browsable emojilib + synonym reference under Auto–Iconize settings. */
export function addEmojiLookupTableSection(containerEl: HTMLElement): void {
	containerEl.createEl("h4", { text: "Emoji & keyword lookup (built-in)" });
	const stats = getEmojiLookupStats();
	containerEl.createEl("p", {
		cls: "setting-item-description",
		text: `Data comes from the bundled emojilib English keyword file (~${stats.total} emojis, ${stats.indexedTokens} index tokens) plus Autosidian’s synonym list. “Match most similar emoji” uses this index when resolving folder names.`,
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

	let resultsHost = containerEl.createDiv({ cls: "autosidian-emoji-lookup-host" });
	let searchDebounce: number | null = null;

	const render = (q: string) => {
		resultsHost.empty();
		const rows = searchEmojiLookupTable(q, 100);
		const wrap = resultsHost.createDiv({ cls: "autosidian-emoji-lookup-scroll" });
		const table = wrap.createEl("table", { cls: "autosidian-icon-rules autosidian-emoji-table" });
		const head = table.createEl("thead").createEl("tr");
		head.createEl("th", { text: "Emoji" });
		head.createEl("th", { text: "Keywords (sample)" });
		const body = table.createEl("tbody");
		for (const r of rows) {
			const tr = body.createEl("tr");
			tr.createEl("td").createEl("span", { text: r.emoji, cls: "autosidian-emoji-cell" });
			tr.createEl("td", { text: r.keywordsSample, cls: "autosidian-emoji-kw" });
		}
		if (rows.length === 0) {
			const tr = body.createEl("tr");
			const td = tr.createEl("td");
			td.colSpan = 2;
			td.setText("No matches — try another substring.");
		}
	};

	new Setting(containerEl)
		.setName("Search emoji / English keywords")
		.setDesc("Filter the built-in table (substring match on index tokens or raw keywords). Leave empty to show the first 100 entries.")
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

	render("");
}
