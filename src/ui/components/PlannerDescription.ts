import { setIcon } from "obsidian";
import { t } from "../../i18n";
import { el } from "../utils/dom";

export interface PlannerDescriptionCallbacks {
    onChange: (value: string) => void;
}

export class PlannerDescription {
    readonly rootEl: HTMLElement;

    private textarea!: HTMLTextAreaElement;

    constructor(private callbacks: PlannerDescriptionCallbacks) {
        this.rootEl = el("div", "bb-description-wrap");
        this.rootEl.appendChild(this._renderLabel());
        this.rootEl.appendChild(this._renderTextarea());
    }

    getValue(): string {
        return this.textarea.value;
    }

    setValue(value: string): void {
        this.textarea.value = value;
    }

    private _renderLabel(): HTMLElement {
        const label = el("div", "bb-description-label");
        const icon = document.createElement("span");
        setIcon(icon, "align-left");
        label.appendChild(icon);
        label.appendChild(document.createTextNode(t("ui.description")));
        return label;
    }

    private _renderTextarea(): HTMLTextAreaElement {
        this.textarea = document.createElement("textarea");
        this.textarea.className = "bb-description-input";
        this.textarea.placeholder = t("ui.descriptionPlaceholder");
        this.textarea.rows = 5;
        this.textarea.spellcheck = false;

        this.textarea.addEventListener("focus", () => {
            this.textarea.spellcheck = true;
        });
        this.textarea.addEventListener("blur", () => {
            this.textarea.spellcheck = false;
        });
        this.textarea.addEventListener("input", () => {
            this.callbacks.onChange(this.textarea.value);
        });

        return this.textarea;
    }
}