import { Notice } from "obsidian";
import {
    PerkId,
    PerkTier,
    getPerksByTier,
    MAX_TIER
} from "../../data/perks";
import type { BuildModel } from "../../models/BuildModel";
import { t } from "../../i18n";
import { el } from "../utils/dom";
import { PERK_ICONS } from "../../data/perk-icons";
import { PERK_STATE } from "../../models/BuildModel";

export interface PerkGridOptions {
    model: BuildModel;
    onChange: () => void;
}

interface PerkCardData {
    id: PerkId;
    tier: PerkTier;
}

export class PerkGrid {
    readonly rootEl: HTMLElement;

    private tooltipEl: HTMLElement | null = null;
    private readonly cardData = new WeakMap<HTMLElement, PerkCardData>();
    private readonly supportsAnchorPositioning: boolean;

    constructor(private opts: PerkGridOptions) {
        this.supportsAnchorPositioning = CSS.supports("anchor-name: --x");
        this.rootEl = el("div", "bb-perk-grid");
        this.render();
    }

    render(): void {
        this.rootEl.empty();

        const maxTier = this.opts.model.maxAvailableTier;

        for (let tier = 1; tier <= MAX_TIER; tier++) {
            this.rootEl.appendChild(this._renderRow(tier, tier <= MAX_TIER));
        }
    }

    refresh(model: BuildModel): void {
        this._updatePerkStates(model);
        this._updateRowStates(model);
    }

    destroy(): void {
        this._hideTooltip();
    }

    private _renderRow(tier: number, unlocked: boolean): HTMLElement {
        const row = el("div", "bb-perk-row");
        if (!unlocked) row.addClass("is-locked");

        const list = el("div", "bb-perk-row-list");
        for (const perk of getPerksByTier(tier)) {
            list.appendChild(this._renderPerk(perk.id, perk.tier));
        }
        row.appendChild(list);
        return row;
    }

    private _renderPerk(id: PerkId, tier: PerkTier): HTMLElement {
        const model = this.opts.model;
        const state = model.getPerkState(id, tier);

        const card = el("button", "bb-perk");
        card.type = "button";
        if (state === PERK_STATE.Selected) card.addClass("is-selected");
        if (state === PERK_STATE.Locked) card.addClass("is-locked");

        card.appendChild(this._renderIcon(id));

        const nameText = t(`perk.${id}.name`);
        const descText = t(`perk.${id}.desc`);
        card.onmouseenter = () => this._showTooltip(card, nameText, descText);
        card.onmouseleave = () => this._hideTooltip();
        card.onclick = () => this._togglePerk(id, tier);

        this.cardData.set(card, { id, tier });

        if (this.supportsAnchorPositioning) {
            const anchorName = `--bb-perk-${id}`;
            card.style.setProperty("anchor-name", anchorName);
            card.dataset.bbAnchorName = anchorName;
        }

        return card;
    }

    private _renderIcon(id: PerkId): HTMLImageElement {
        const icon = document.createElement("img");
        icon.className = "bb-perk-icon";
        icon.src = PERK_ICONS[id] ?? "";
        icon.alt = "";
        icon.draggable = false;
        if (!PERK_ICONS[id]) {
            icon.style.display = "none";
        };
        return icon;
    }

    private _togglePerk(id: PerkId, tier: PerkTier): void {
        const ok = this.opts.model.toggle(id, tier);
        if (!ok) {
            new Notice(`${t("ui.remaining")}: ${this.opts.model.remaining}`);
            return;
        }
        this.opts.onChange();
    }

    private _updatePerkStates(model: BuildModel): void {
        this.rootEl.querySelectorAll<HTMLElement>(".bb-perk").forEach((btn) => {
            const data = this.cardData.get(btn);
            if (!data) return;
            const state = model.getPerkState(data.id, data.tier);
            btn.classList.toggle("is-selected", state === PERK_STATE.Selected);
            btn.classList.toggle("is-locked", state === PERK_STATE.Locked);
        });
    }

    private _updateRowStates(model: BuildModel): void {
        const maxTier = model.maxAvailableTier;
        this.rootEl.querySelectorAll<HTMLElement>(".bb-perk-row").forEach((row, i) => {
            row.classList.toggle("is-locked", i + 1 > maxTier);
        });
    }

    private _showTooltip(anchor: HTMLElement, name: string, desc: string): void {
        this._hideTooltip();

        const tip = el("div", "bb-tooltip");
        tip.appendChild(el("div", "bb-tooltip-name", name));
        tip.appendChild(el("div", "bb-tooltip-desc", desc));

        if (this.supportsAnchorPositioning) {
            const anchorName = anchor.dataset.bbAnchorName;
            if (anchorName) {
                tip.style.setProperty("--bb-anchor", anchorName);
                tip.classList.add("bb-tooltip--anchored");
            }
        }

        document.body.appendChild(tip);
        this.tooltipEl = tip;

        if (!this.supportsAnchorPositioning) {
            this._positionTooltipManually(tip, anchor);
        }

        tip.classList.add("is-visible");
    }

    private _positionTooltipManually(tip: HTMLDivElement, anchor: HTMLElement): void {
        const rect = anchor.getBoundingClientRect();
        const tipRect = tip.getBoundingClientRect();

        let top = rect.top - tipRect.height - 8;
        let left = rect.left + rect.width / 2 - tipRect.width / 2;

        if (top < 4) top = rect.bottom + 8;

        const maxLeft = window.innerWidth - tipRect.width - 4;
        if (left < 4) left = 4;
        if (left > maxLeft) left = maxLeft;

        tip.style.top = `${top}px`;
        tip.style.left = `${left}px`;
        tip.classList.add("is-visible");
    }

    private _hideTooltip(): void {
        if (this.tooltipEl) {
            this.tooltipEl.remove();
            this.tooltipEl = null;
        }
    }
}