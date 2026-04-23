import type { TFolder } from "obsidian";
import { Notice } from "obsidian";
import type AutosidianPlugin from "../main";
import { applyIconToFolder } from "./applyIconFrontmatter";

function clampPpm(n: number): number {
	return Math.max(1, Math.min(120, Math.floor(n)));
}

export class RetroactiveIconizeQueue {
	private q: TFolder[] = [];
	private tick: number | null = null;
	private readonly plugin: AutosidianPlugin;

	constructor(p: AutosidianPlugin) {
		this.plugin = p;
	}

	refresh(announce: boolean, queue: TFolder[]): void {
		if (!this.plugin.settings.iconize.retro) {
			this.halt();
			return;
		}
		if (this.q.length === 0 || announce) {
			this.q = queue;
			if (announce) {
				if (this.q.length) {
					new Notice(`Autosidian: Iconize retro — ${this.q.length} folder(s) in queue.`);
				} else {
					new Notice("Autosidian: Iconize retro — no folders to process.");
				}
			}
		}
		this.ensure();
	}

	restartTimer(): void {
		if (this.tick !== null) {
			window.clearInterval(this.tick);
			this.tick = null;
		}
		if (this.plugin.settings.iconize.retro) {
			this.ensure();
		}
	}

	private ensure(): void {
		if (this.tick !== null) {
			return;
		}
		if (!this.plugin.settings.iconize.retro || this.q.length === 0) {
			return;
		}
		const ms = Math.max(1, Math.round(60_000 / clampPpm(this.plugin.settings.iconize.retroPerMinute)));
		this.tick = window.setInterval(() => {
			void this.pulse();
		}, ms);
		this.plugin.registerInterval(this.tick);
	}

	private async pulse(): Promise<void> {
		if (!this.plugin.settings.iconize.retro) {
			this.halt();
			return;
		}
		const f = this.q.shift();
		if (f) {
			try {
				await applyIconToFolder(this.plugin.app, f, this.plugin.settings.iconize);
			} catch (e) {
				console.error("[Autosidian] iconize retro", e);
			}
		}
		if (this.q.length === 0 && this.tick !== null) {
			window.clearInterval(this.tick);
			this.tick = null;
		}
	}

	/** Notes still waiting in the retro queue. */
	getQueueLength(): number {
		return this.q.length;
	}

	halt(): void {
		if (this.tick !== null) {
			window.clearInterval(this.tick);
			this.tick = null;
		}
		this.q = [];
	}
}
