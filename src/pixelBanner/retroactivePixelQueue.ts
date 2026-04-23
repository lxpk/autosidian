import type { TFile } from "obsidian";
import { Notice } from "obsidian";
import type AutosidianPlugin from "../main";
import { noteTitleAsBannerKeyword } from "./keywordsForBanner";
import { setBannerOnFile } from "./applyBanner";

function clampPpm(n: number): number {
	return Math.max(1, Math.min(120, Math.floor(n)));
}

export class RetroactivePixelQueue {
	private q: TFile[] = [];
	private tick: number | null = null;
	private readonly plugin: AutosidianPlugin;

	constructor(p: AutosidianPlugin) {
		this.plugin = p;
	}

	refresh(announce: boolean, queue: TFile[]): void {
		if (!this.plugin.settings.pixelBanner.retro) {
			this.halt();
			return;
		}
		if (this.q.length === 0 || announce) {
			this.q = queue;
			if (announce) {
				if (this.q.length) {
					new Notice(`Autosidian: Pixel Banner retro — ${this.q.length} note(s) in queue.`);
				} else {
					new Notice("Autosidian: Pixel Banner retro — no notes need a banner.");
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
		if (this.plugin.settings.pixelBanner.retro) {
			this.ensure();
		}
	}

	private ensure(): void {
		if (this.tick !== null || !this.plugin.settings.pixelBanner.retro || this.q.length === 0) {
			return;
		}
		const ms = Math.max(1, Math.round(60_000 / clampPpm(this.plugin.settings.pixelBanner.retroPerMinute)));
		this.tick = window.setInterval(() => {
			void this.pulse();
		}, ms);
		this.plugin.registerInterval(this.tick);
	}

	private async pulse(): Promise<void> {
		if (!this.plugin.settings.pixelBanner.retro) {
			this.halt();
			return;
		}
		const f = this.q.shift();
		if (f) {
			try {
				const banner = noteTitleAsBannerKeyword(
					f.basename,
					this.plugin.settings.pixelBanner.ignoreTitleForSeed
				);
				if (banner) {
					await setBannerOnFile(this.plugin.app, f, banner, this.plugin.settings.pixelBanner);
				}
			} catch (e) {
				console.error("[Autosidian] pixel retro", e);
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
