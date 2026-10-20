import { setIcon } from "obsidian";
import { t } from "../../i18n";
import { el } from "../utils/dom";

export interface PlannerHeaderCallbacks {
    onNew: () => void;
    onSave: () => void;
    onLoad: () => void;
    onRename: () => void;
    onDelete: () => void;
    onTitleChange: (title: string) => void;
}

export class PlannerHeader {
    readonly rootEl: HTMLElement;

    private remainingEl!: HTMLElement;
    private titleInput!: HTMLInputElement;

    constructor(private callbacks: PlannerHeaderCallbacks) {
        this.rootEl = el("div", "bb-header");
        this.rootEl.appendChild(this._renderTopRow());
        this.rootEl.appendChild(this._renderTitle());
    }

    setTitle(value: string): void {
        this.titleInput.value = value;
    }

    setRemaining(value: number): void {
        this.remainingEl.textContent = String(value);
    }

    private _renderTopRow(): HTMLElement {
        const row = el("div", "bb-header-top");
        row.appendChild(this._renderStatus());
        row.appendChild(this._renderToolbar());
        return row;
    }

    private _renderStatus(): HTMLElement {
        const status = el("div", "bb-status");

        this.remainingEl = el("div", "bb-status-remaining", "0");
        status.appendChild(this.remainingEl);

        status.appendChild(el("div", "bb-status-label", t("ui.remaining")));

        return status;
    }

    private _renderToolbar(): HTMLElement {
        const bar = el("div", "bb-toolbar");

        bar.appendChild(this._toolbarButton(
            "file-plus",
            t("ui.newBuild"),
            () => this.callbacks.onNew()));
        bar.appendChild(this._toolbarButton(
            "save",
            t("ui.saveBuild"),
            () => this.callbacks.onSave()));
        bar.appendChild(this._toolbarButton(
            "folder-open",
            t("ui.loadBuild"),
            () => this.callbacks.onLoad()));
        bar.appendChild(this._toolbarButton(
            "pen",
            t("ui.renameBuild"),
            () => this.callbacks.onRename()));
        bar.appendChild(this._toolbarButton(
            "trash-2",
            t("ui.deleteBuild"),
            () => this.callbacks.onDelete()));

        return bar;
    }

    private _toolbarButton(icon: string, title: string, onClick: () => void): HTMLButtonElement {
        const btn = document.createElement("button");
        btn.className = "bb-toolbar-btn";
        btn.type = "button";
        btn.setAttribute("aria-label", title);
        btn.onclick = onClick;

        const iconEl = document.createElement("span");
        iconEl.className = "bb-toolbar-btn-icon";
        setIcon(iconEl, icon);
        btn.appendChild(iconEl);

        return btn;
    }

    private _renderTitle(): HTMLElement {
        const wrap = el("div", "bb-title-wrap");

        this.titleInput = document.createElement("input");
        this.titleInput.type = "text";
        this.titleInput.className = "bb-title-input";
        this.titleInput.placeholder = t("modal.buildName");
        this.titleInput.addEventListener("input", () => {
            this.callbacks.onTitleChange(this.titleInput.value);
        });

        wrap.appendChild(this.titleInput);
        return wrap;
    }
}