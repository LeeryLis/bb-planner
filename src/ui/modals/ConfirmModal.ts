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

        const buttons = el("div", "bb-modal-buttons");

        const cancel = el(
            "button",
            "bb-modal-btn",
            this.options.cancelText ?? t("modal.cancel")
        );
        cancel.onclick = () => this._finish(false);
        buttons.appendChild(cancel);

        const confirmClass = this.options.confirmClass ?? "is-primary";
        const ok = el(
            "button",
            `bb-modal-btn ${confirmClass}`,
            this.options.confirmText ?? t("modal.save")
        );
        ok.onclick = () => this._finish(true);
        buttons.appendChild(ok);

        contentEl.appendChild(buttons);
    }

    onClose(): void {
        this.contentEl.empty();
        this._finish(false);
    }

    private _finish(value: boolean): void {
        if (this.resolved) return;
        this.resolved = true;
        this.close();
        this.resolve(value);
    }
}