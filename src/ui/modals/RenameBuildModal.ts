import { App, Modal } from "obsidian";
import { t } from "../../i18n";
import { el } from "../utils/dom";

export class RenameBuildModal extends Modal {
    private resolved = false;
    private inputEl!: HTMLInputElement;

    private constructor(
        app: App,
        private currentName: string,
        private resolve: (value: string | null) => void
    ) {
        super(app);
    }

    static ask(app: App, currentName: string): Promise<string | null> {
        return new Promise((resolve) => {
            new RenameBuildModal(app, currentName, resolve).open();
        });
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl("h2", { text: t("modal.renameBuild") });
        contentEl.appendChild(this._renderInput());
        contentEl.appendChild(this._renderButtons());

        this._focusInput();
    }

    onClose(): void {
        this.contentEl.empty();
        this._finish(null);
    }

    private _renderInput(): HTMLInputElement {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "bb-rename-input";
        input.value = this.currentName;
        input.addEventListener("keydown", (e) => this._onKeyDown(e));
        this.inputEl = input;
        return input;
    }

    private _renderButtons(): HTMLElement {
        const buttons = el("div", "bb-modal-buttons");
        buttons.appendChild(
            this._renderButton(
                t("modal.cancel"),
                "bb-modal-btn",
                () => this._cancel())
        );
        buttons.appendChild(
            this._renderButton(
                t("modal.renameConfirm"),
                "bb-modal-btn is-primary",
                () => this._confirm())
        );
        return buttons;
    }

    private _renderButton(
        text: string,
        className: string,
        onClick: () => void
    ): HTMLButtonElement {
        const btn = el("button", className, text);
        btn.type = "button";
        btn.onclick = onClick;
        return btn;
    }

    private _focusInput(): void {
        this.inputEl.focus();
        this.inputEl.select();
    }

    private _onKeyDown(e: KeyboardEvent): void {
        if (e.key === "Enter") {
            e.preventDefault();
            this._confirm();
        } else if (e.key === "Escape") {
            e.preventDefault();
            this._cancel();
        }
    }

    private _confirm(): void {
        const value = this.inputEl.value.trim();
        if (!value) return;
        if (value === this.currentName) {
            this._finish(null);
            return;
        }
        this._finish(value);
    }

    private _cancel(): void {
        this._finish(null);
    }

    private _finish(value: string | null): void {
        if (this.resolved) return;
        this.resolved = true;
        this.close();
        this.resolve(value);
    }
}