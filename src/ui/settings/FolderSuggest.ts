import { AbstractInputSuggest, App, TFolder } from "obsidian";

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
    private folders: TFolder[];
    private myInput: HTMLInputElement;

    constructor(app: App, inputEl: HTMLInputElement) {
        super(app, inputEl);
        this.myInput = inputEl;
        this.folders = app.vault.getAllLoadedFiles()
            .filter((file): file is TFolder => file instanceof TFolder);
    }

    getSuggestions(query: string): TFolder[] {
        const lowerQuery = query.toLowerCase();
        return this.folders.filter(folder =>
            folder.path.toLowerCase().includes(lowerQuery)
        );
    }

    renderSuggestion(folder: TFolder, el: HTMLElement): void {
        el.createEl("div", { text: folder.path });
    }

    selectSuggestion(folder: TFolder): void {
        this.myInput.value = folder.path;
        this.myInput.dispatchEvent(new Event('input'));
        this.close();
    }
}