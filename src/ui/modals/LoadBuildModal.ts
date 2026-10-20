import { App, Modal, setIcon } from "obsidian";
import type { Build } from "../../types";
import { t } from "../../i18n";
import { el } from "../utils/dom";

export const SORT_MODE = {
    Alpha: "alpha",
    Created: "created"
}

export type SortMode = typeof SORT_MODE[keyof typeof SORT_MODE];

export class LoadBuildModal extends Modal {
    private sortMode: SortMode = SORT_MODE.Alpha;

    constructor(
        app: App,
        private builds: Build[],
        private onLoad: (build: Build) => void
    ) {
        super(app);
    }

    onOpen(): void {
        this._render();
    }

    onClose(): void {
        this.contentEl.empty();
    }

    private _render(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl("h2", { text: t("ui.loadBuild") });

        if (!this.builds.length) {
            contentEl.createEl("p", { text: t("modal.noBuilds") });
            return;
        }

        contentEl.appendChild(this._renderSortRow());
        contentEl.appendChild(this._renderBuildList());
    }

    private _renderSortRow(): HTMLElement {
        const row = el("div", "bb-build-sort");
        row.appendChild(
            this._sortBtn(SORT_MODE.Alpha, "case-sensitive", t("modal.sortAlpha"))
        );
        row.appendChild(
            this._sortBtn(SORT_MODE.Created, "calendar", t("modal.sortCreated"))
        );
        return row;
    }

    private _renderBuildList(): HTMLElement {
        const list = el("div", "bb-build-list");
        for (const build of this._sorted()) {
            list.appendChild(this._renderBuildItem(build));
        }
        return list;
    }

    private _renderBuildItem(build: Build): HTMLButtonElement {
        const item = el("button", "bb-build-list-item");
        item.type = "button";
        item.appendChild(el("div", "bb-build-list-name", build.name));
        item.onclick = () => {
            this.onLoad(build);
            this.close();
        };
        return item;
    }

    private _sortBtn(
        mode: SortMode,
        icon: string,
        title: string
    ): HTMLButtonElement {
        const btn = document.createElement("button");
        btn.className = "bb-sort-btn";
        btn.setAttribute("aria-label", title);
        if (this.sortMode === mode) btn.classList.add("is-active");

        const iconEl = document.createElement("span");
        iconEl.className = "bb-sort-btn-icon";
        setIcon(iconEl, icon);
        btn.appendChild(iconEl);

        btn.onclick = () => {
            this.sortMode = mode;
            this._render();
        };

        return btn;
    }

    private _sorted(): Build[] {
        const items = [...this.builds];
        if (this.sortMode === SORT_MODE.Alpha) {
            items.sort((a, b) =>
                a.name.localeCompare(b.name, undefined, {
                    sensitivity: "base",
                    numeric: true,
                })
            );
        } else {
            items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        }
        return items;
    }
}