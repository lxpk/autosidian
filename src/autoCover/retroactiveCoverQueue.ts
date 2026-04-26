import type { TFile } from "obsidian";
import { Notice } from "obsidian";
import type AutosidianPlugin from "../main";
import { noteTitleAsCoverQuery } from "./coverQueries";
import { searchFirstCover } from "./coverSearch";
import { obsidianCoverHttp } from "./coverHttp";
import { setCoverOnFile } from "./applyCover";

function clampPpm(n: number): number {
	return Math.max(1, Math.min(120, Math.floor(n)));
}

/**
 * Background worker that walks notes missing the `cover` field, runs an image search per note,
 * and writes the chosen URL into front matter. One file per pulse to throttle network calls.
 */
export class RetroactiveCoverQueue {
	private q: TFile[] = [];
	private tick: number | null = null;
	private readonly plugin: AutosidianPlugin;

	constructor(p: AutosidianPlugin) {
		this.plugin = p;
	}

	refresh(announce: boolean, queue: TFile[]): void {
		if (!this.plugin.settings.autoCover.retro) {
			this.halt();
			return;
		}
		if (this.q.length === 0 || announce) {
			this.q = queue;
			if (announce) {
				if (this.q.length) {
					new Notice(
						`Autosidian: Auto–Cover retro — ${this.q.length} note(s) in queue.`
					);
				} else {
					new Notice("Autosidian: Auto–Cover retro — no notes need a cover.");
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
		if (this.plugin.settings.autoCover.retro) {
			this.ensure();
		}
	}

	private ensure(): void {
		if (this.tick !== null || !this.plugin.settings.autoCover.retro || this.q.length === 0) {
			return;
		}
		const ms = Math.max(
			1,
			Math.round(60_000 / clampPpm(this.plugin.settings.autoCover.retroPerMinute))
		);
		this.tick = window.setInterval(() => {
			void this.pulse();
		}, ms);
		this.plugin.registerInterval(this.tick);
	}

	private async pulse(): Promise<void> {
		if (!this.plugin.settings.autoCover.retro) {
			this.halt();
			return;
		}
		const f = this.q.shift();
		if (f) {
			try {
				const s = this.plugin.settings.autoCover;
				const query = noteTitleAsCoverQuery(f.basename, s.ignoreTitleForSeed);
				if (query) {
					const hit = await searchFirstCover(query, s, obsidianCoverHttp);
					if (hit) {
						await setCoverOnFile(this.plugin.app, f, hit.url, s);
					}
				}
			} catch (e) {
				console.error("[Autosidian] cover retro", e);
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
