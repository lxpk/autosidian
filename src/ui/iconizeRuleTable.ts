import type AutosidianPlugin from "../main";

/**
 * In-app table for icon keyword → emoji (or Iconize ID), so users can edit without JSON.
 */
export function addIconizeRuleTableSection(
	parent: HTMLElement,
	plugin: AutosidianPlugin,
	save: () => Promise<void>
): void {
	parent.createEl("h4", { text: "Keyword → icon rules" });
	parent.createEl("p", {
		cls: "setting-item-description",
		text: "Longest matching keyword wins. You can also use Copy/Import JSON for bulk edits. At least one rule is kept.",
	});
	const tableHost = parent.createDiv({ cls: "autosidian-icon-rule-table" });

	const redraw = (): void => {
		tableHost.empty();
		const rules = plugin.settings.iconize.rules;
		if (rules.length === 0) {
			plugin.settings.iconize.rules.push({ keyword: "note", icon: "📝" });
		}
		const tbl = tableHost.createEl("table", { cls: "autosidian-icon-rules" });
		const thead = tbl.createEl("thead");
		const thr = thead.createEl("tr");
		thr.createEl("th", { text: "Keyword" });
		thr.createEl("th", { text: "Icon" });
		thr.createEl("th", { text: "" });
		const tb = tbl.createEl("tbody");
		plugin.settings.iconize.rules.forEach((rule, i) => {
			const tr = tb.createEl("tr");
			const tdk = tr.createEl("td");
			const inK = tdk.createEl("input", { type: "text" });
			inK.addClass("autosidian-input");
			inK.value = rule.keyword;
			inK.addEventListener("change", () => {
				plugin.settings.iconize.rules[i]!.keyword = inK.value;
				void save();
			});
			const tdi = tr.createEl("td");
			const inI = tdi.createEl("input", { type: "text" });
			inI.addClass("autosidian-input");
			inI.value = rule.icon;
			inI.addEventListener("change", () => {
				plugin.settings.iconize.rules[i]!.icon = inI.value;
				void save();
			});
			const tdb = tr.createEl("td");
			const rem = tdb.createEl("button", { text: "Remove" });
			rem.addClass("mod-warning");
			rem.addEventListener("click", () => {
				plugin.settings.iconize.rules.splice(i, 1);
				if (plugin.settings.iconize.rules.length === 0) {
					plugin.settings.iconize.rules.push({ keyword: "note", icon: "📝" });
				}
				void save();
				redraw();
			});
		});
		const addRow = tableHost.createEl("p");
		const addB = addRow.createEl("button", { text: "Add rule", cls: "mod-cta" });
		addB.addEventListener("click", () => {
			plugin.settings.iconize.rules.push({ keyword: "new", icon: "📝" });
			void save();
			redraw();
		});
	};

	redraw();
}
