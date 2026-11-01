import { App, Notice, TFile, TFolder, normalizePath } from "obsidian";
import { isPerkId, PerkId } from "../data/perks";
import type { Build } from "../types";
import { t } from "../i18n";
import { BuildAlreadyExistsError, BuildNotFoundError } from "./errors";
import { FM, FM_TYPE } from "../frontmatter";

const FALLBACK_BUILD_NAME = "unnamed";
const FORBIDDEN_FILENAME_CHARS = /[\\/:*?"<>|]/g;
const METADATA_TIMEOUT_MS = 500;
const DEFAULT_INDEX_NAME = "Builds";

export class BuildStore {
    constructor(
        private app: App,
        private getFolder: () => string,
        private getIndexName: () => string
    ) { }

    async list(): Promise<Build[]> {
        const folder = this._resolveFolder();
        if (!folder) return [];

        const root = this.app.vault.getAbstractFileByPath(folder);
        if (!(root instanceof TFolder)) return [];

        const builds: Build[] = [];
        for (const child of root.children) {
            if (!this._isMarkdownFile(child)) continue;
            const build = await this._readBuild(child);
            if (build) builds.push(build);
        }
        return builds;
    }

    async getByName(name: string): Promise<Build | null> {
        const file = this._resolveBuildFile(name);
        if (!file) return null;
        return this._readBuild(file);
    }

    async save(build: Build): Promise<void> {
        const folder = this._resolveFolderOrThrow();
        await this._ensureIndex();

        const filePath = this._buildFilePath(folder, build.name);
        const existing = this.app.vault.getAbstractFileByPath(filePath);

        if (existing instanceof TFile) {
            await this._writeBuild(existing, build);
            return;
        }

        const created = await this.app.vault.create(
            filePath,
            this._serializeBuild(build)
        );
        if (created instanceof TFile) {
            await this._waitForMetadata(created);
        }
    }

    async delete(build: Build): Promise<void> {
        const file = this._resolveBuildFile(build.name);
        if (file) await this.app.vault.delete(file);
    }

    async rename(oldName: string, newName: string): Promise<void> {
        const folder = this._resolveFolderOrThrow();
        const oldFile = this._resolveBuildFile(oldName);
        if (!oldFile) {
            throw new BuildNotFoundError(oldName);
        }

        const safeNewName = this._safeName(newName);
        const newPath = this._buildFilePath(folder, safeNewName);
        if (oldFile.path === newPath) return;

        const existing = this.app.vault.getAbstractFileByPath(newPath);
        if (existing) {
            throw new BuildAlreadyExistsError(newName);
        }

        await this.app.fileManager.renameFile(oldFile, newPath);
    }

    private _resolveIndexName(): string {
        const raw = this.getIndexName().trim();
        return this._safeName(raw || DEFAULT_INDEX_NAME);
    }

    private _resolveIndexPath(): string {
        const folder = this._resolveFolder();
        if (!folder) return "";
        return normalizePath(`${folder}/${this._resolveIndexName()}.md`);
    }

    private _findIndexFile(): TFile | null {
        const path = this._resolveIndexPath();
        if (!path) return null;
        const file = this.app.vault.getAbstractFileByPath(path);
        return file instanceof TFile ? file : null;
    }

    private async _ensureIndex(): Promise<TFile | null> {
        const existing = this._findIndexFile();
        if (existing) return existing;

        const folder = this._resolveFolder();
        if (!folder) return null;
        if (!(this.app.vault.getAbstractFileByPath(folder) instanceof TFolder)) return null;

        try {
            return await this.app.vault.create(
                this._resolveIndexPath(),
                this._serializeIndex()
            );
        } catch {
            return null;
        }
    }

    private _resolveFolder(): string | null {
        const folder = this.getFolder().trim();
        return folder ? normalizePath(folder) : null;
    }

    private _resolveFolderOrThrow(): string {
        const folder = this._resolveFolder();
        if (!folder) {
            new Notice(t("notice.folderMissing", { path: this.getFolder() }));
            throw new Error("Builds folder is not set or does not exist");
        }
        const root = this.app.vault.getAbstractFileByPath(folder);
        if (!(root instanceof TFolder)) {
            new Notice(t("notice.folderMissing", { path: folder }));
            throw new Error("Builds folder does not exist");
        }
        return folder;
    }

    private _resolveBuildFile(name: string): TFile | null {
        const folder = this._resolveFolder();
        if (!folder) return null;
        const filePath = this._buildFilePath(folder, name);
        const file = this.app.vault.getAbstractFileByPath(filePath);
        return file instanceof TFile ? file : null;
    }

    private _buildFilePath(folder: string, name: string): string {
        return normalizePath(`${folder}/${this._safeName(name)}.md`);
    }

    private _isMarkdownFile(file: unknown): file is TFile {
        return file instanceof TFile && file.extension === "md";
    }

    private async _readBuild(file: TFile): Promise<Build | null> {
        const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
        if (!this._isBuildFrontmatter(fm)) return null;

        const content = await this.app.vault.cachedRead(file);
        const { body } = this._splitFrontmatter(content);

        return {
            name: file.basename,
            perks: this._parsePerks(fm[FM.perks]),
            description: body,
            createdAt: file.stat.ctime,
        };
    }

    private _isBuildFrontmatter(fm: unknown): fm is Record<string, unknown> {
        return (
            typeof fm === "object" &&
            fm !== null &&
            (fm as Record<string, unknown>)[FM.type] === FM_TYPE.build
        );
    }

    private _parsePerks(raw: unknown): PerkId[] {
        if (!Array.isArray(raw)) return [];
        return raw
            .map(String)
            .filter(isPerkId);
    }

    private async _writeBuild(file: TFile, build: Build): Promise<void> {
        await this._writeFrontmatter(file, build);
        await this._writeBody(file, build.description ?? "");
        await this._waitForMetadata(file);
    }

    private async _writeFrontmatter(file: TFile, build: Build): Promise<void> {
        const indexName = this._resolveIndexName();
        await this.app.fileManager.processFrontMatter(file, (fm) => {
            fm[FM.type] = FM_TYPE.build;
            fm[FM.perks] = [...build.perks];
            fm[FM.moc] = `[[${indexName}]]`;
            delete fm.description;
            delete fm.type;
            delete fm.perks;
        });
    }

    private async _writeBody(file: TFile, description: string): Promise<void> {
        await this.app.vault.process(file, (content) => {
            const { yaml } = this._splitFrontmatter(content);
            return yaml + description;
        });
    }

    private _splitFrontmatter(content: string): { yaml: string; body: string } {
        const start = content.startsWith("\uFEFF") ? 1 : 0;

        if (content.slice(start, start + 3) !== "---") {
            return { yaml: "", body: content };
        }

        const firstNewline = content.indexOf("\n", start);
        if (firstNewline === -1) {
            return { yaml: "", body: content };
        }

        const rest = content.slice(firstNewline + 1);
        const closeMatch = /^---[ \t]*$/m.exec(rest);
        if (!closeMatch) {
            return { yaml: "", body: content };
        }

        let bodyStart = firstNewline + 1 + closeMatch.index + closeMatch[0].length;
        if (content[bodyStart] === "\r") bodyStart++;
        if (content[bodyStart] === "\n") bodyStart++;

        return {
            yaml: content.slice(0, bodyStart),
            body: content.slice(bodyStart),
        };
    }

    private _serializeBuild(build: Build): string {
        const indexName = this._resolveIndexName();
        const lines: string[] = [
            "---",
            `${FM.type}: ${FM_TYPE.build}`,
            `${FM.perks}:`,
            ...build.perks.map((p) => `  - ${p}`),
            `${FM.moc}: "[[${indexName}]]"`,
            "---",
            "",
        ];
        return lines.join("\n") + (build.description ?? "");
    }

    private _serializeIndex(): string {
        return [
            "---",
            `${FM.type}: ${FM_TYPE.index}`,
            "---",
            "",
        ].join("\n");
    }

    private _waitForMetadata(file: TFile): Promise<void> {
        return new Promise((resolve) => {
            let settled = false;

            const finish = (): void => {
                if (settled) return;
                settled = true;
                this.app.metadataCache.offref(ref);
                window.clearTimeout(timer);
                resolve();
            };

            const ref = this.app.metadataCache.on("changed", (f) => {
                if (f.path === file.path) finish();
            });
            const timer = window.setTimeout(finish, METADATA_TIMEOUT_MS);
        });
    }

    private _safeName(name: string): string {
        return name.replace(FORBIDDEN_FILENAME_CHARS, "_").trim() || FALLBACK_BUILD_NAME;
    }
}