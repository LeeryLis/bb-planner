import { App, Modal } from "obsidian";
import { t } from "../../i18n";
import { el } from "../utils/dom";

export interface ConfirmModalOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmClass?: "is-primary" | "is-danger";
}

export class ConfirmModal extends Modal {
    private resolved = false;

    private constructor(
        app: App,
        private options: ConfirmModalOptions,
        private resolve: (value: boolean) => void
    ) {
        super(app);
    }

    static ask(app: App, options: ConfirmModalOptions): Promise<boolean> {
        return new Promise((resolve) => {
            new ConfirmModal(app, options, resolve).open();
        });
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl("h2", { text: this.options.title });
        contentEl.createEl("p", { text: this.options.message });
        contentEl.appendChild(this._renderButtons());
    }

    onClose(): void {
        this.contentEl.empty();
        this._finish(false);
    }

    private _renderButtons(): HTMLElement {
        const buttons = el("div", "bb-modal-buttons");
        buttons.appendChild(
            this._renderButton(
                this.options.cancelText ?? t("modal.cancel"),
                "bb-modal-btn",
                () => this._finish(false)
            )
        );
        buttons.appendChild(
            this._renderButton(
                this.options.confirmText ?? t("modal.save"),
                `bb-modal-btn ${this.options.confirmClass ?? "is-primary"}`,
                () => this._finish(true)
            )
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

    private _finish(value: boolean): void {
        if (this.resolved) return;
        this.resolved = true;
        this.close();
        this.resolve(value);
    }
}