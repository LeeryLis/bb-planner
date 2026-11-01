import { App, TFile } from "obsidian";
import { InputSuggest } from "./InputSuggest";

export class NoteSuggest extends InputSuggest<TFile> {
    constructor(app: App, inputEl: HTMLInputElement) {
        const notes = app.vault
            .getMarkdownFiles()
            .sort((a, b) => a.basename.localeCompare(b.basename));
        super(app, inputEl, notes);
    }

    protected toText(file: TFile): string {
        return file.basename;
    }
}