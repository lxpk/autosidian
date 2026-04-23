import type { TFolder } from "obsidian";
import { Notice } from "obsidian";
import type AutosidianPlugin from "../main";
import { ensureFolderNoteForFolder } from "./ensureFolderNote";
import { getFoldersMissingFolderNote } from "./iterFolders";

function clampPerMinute(n: number): number {
	return Math.max(1, Math.min(120, Math.floor(n)));
}

/**
 * When `settings.folderNotes.retroactive` is on, processes a queue of folders
 * that lack `Name/Name.md`, at up to `retroactivePerMinute` per minute.
 */
export class RetroactiveFolderNotes {
	private q: TFolder[] = [];
	private tick: number | null = null;
	private readonly plugin: AutosidianPlugin;

	constructor(plugin: AutosidianPlugin) {
		this.plugin = plugin;
	}

	/** Re-read queue from vault (e.g. when enabling retro or changing rate). */
	refresh(announce = false): void {
		if (!this.plugin.settings.folderNotes.retroactive) {
			this.halt();
			return;
		}
		if (this.q.length === 0 || announce) {
			this.q = getFoldersMissingFolderNote(this.plugin.app.vault.getRoot());
			if (announce) {
				if (this.q.length) {
					new Notice(`Autosidian: retro — ${this.q.length} folder(s) in queue.`);
				} else {
					new Notice("Autosidian: retro — no folders need a folder note.");
				}
			}
		}
		this.ensureInterval();
	}

	/** PPM or retro toggle changed while active — restart the timer with a new period. */
	restartTimer(): void {
		if (this.tick !== null) {
			window.clearInterval(this.tick);
			this.tick = null;
		}
		if (this.plugin.settings.folderNotes.retroactive) {
			this.ensureInterval();
		}
	}

	private ensureInterval(): void {
		if (this.tick !== null) {
			return;
		}
		if (!this.plugin.settings.folderNotes.retroactive) {
			return;
		}
		if (this.q.length === 0) {
			return;
		}
		const ms = Math.max(1, Math.round(60_000 / clampPerMinute(this.plugin.settings.folderNotes.retroactivePerMinute)));
		this.tick = window.setInterval(() => {
			void this.pulse();
		}, ms);
		this.plugin.registerInterval(this.tick);
	}

	private async pulse(): Promise<void> {
		if (!this.plugin.settings.folderNotes.retroactive) {
			this.halt();
			return;
		}
		const f = this.q.shift();
		if (f) {
			try {
				await ensureFolderNoteForFolder(f.vault, f);
			} catch (e) {
				console.error("[Autosidian] retroactive pulse", e);
			}
		}
		if (this.q.length === 0) {
			if (this.tick !== null) {
				window.clearInterval(this.tick);
				this.tick = null;
			}
		}
	}

	halt(): void {
		if (this.tick !== null) {
			window.clearInterval(this.tick);
			this.tick = null;
		}
		this.q = [];
	}
}
