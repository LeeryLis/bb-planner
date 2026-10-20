import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import { BuildModel } from "../../models/BuildModel";
import { BuildStore } from "../../models/BuildStore";
import { PerkGrid } from "../components/PerkGrid";
import { PlannerHeader } from "../components/PlannerHeader";
import { PlannerDescription } from "../components/PlannerDescription";
import { ConfirmModal } from "../modals/ConfirmModal";
import { LoadBuildModal } from "../modals/LoadBuildModal";
import { el } from "../utils/dom";
import { t } from "../../i18n";
import { BuildAlreadyExistsError } from "../../models/errors";
import { RenameBuildModal } from "../modals/RenameBuildModal";

export const VIEW_TYPE_BB_PLANNER = "bb-planner-view";
export const DEFAULT_BUILD_NAME = "Untitled";

export class PlannerView extends ItemView {
    private model = new BuildModel();
    private currentBuildName = "";

    private grid!: PerkGrid;
    private header!: PlannerHeader;
    private description!: PlannerDescription;

    constructor(
        leaf: WorkspaceLeaf,
        private store: BuildStore,
    ) {
        super(leaf);
    }

    getViewType(): string {
        return VIEW_TYPE_BB_PLANNER;
    }

    getDisplayText(): string {
        return t("plugin.ribbon");
    }

    getIcon(): string {
        return "swords";
    }

    async onOpen(): Promise<void> {
        this.contentEl.empty();
        this.contentEl.addClass("bb-planner-view");

        const card = el("div", "bb-planner-card");
        card.appendChild(this._buildHeader());
        card.appendChild(this._buildGrid());
        card.appendChild(this._buildDescription());

        this.contentEl.appendChild(card);
        this._refreshAll();
    }

    async onClose(): Promise<void> {
        this.grid?.destroy();
        this.contentEl.empty();
    }

    private _buildHeader(): HTMLElement {
        this.header = new PlannerHeader({
            onNew: () => this._resetBuild(),
            onSave: () => void this._saveCurrentBuild(),
            onLoad: () => void this._openLoadModal(),
            onRename: () => void this._openRenameModal(),
            onDelete: () => void this._openDeleteModal(),
            onTitleChange: (title) => {
                this.currentBuildName = title;
            },
        });
        return this.header.rootEl;
    }

    private _buildGrid(): HTMLElement {
        this.grid = new PerkGrid({
            model: this.model,
            onChange: () => this._onModelChanged(),
        });
        return this.grid.rootEl;
    }

    private _buildDescription(): HTMLElement {
        this.description = new PlannerDescription({
            onChange: (value) => this.model.setDescription(value),
        });
        return this.description.rootEl;
    }

    private _onModelChanged(): void {
        this.grid.refresh(this.model);
        this.header.setRemaining(this.model.remaining);
    }

    private _refreshAll(): void {
        this.grid.refresh(this.model);
        this.header.setRemaining(this.model.remaining);
        this.header.setTitle(this.currentBuildName);
        this.description.setValue(this.model.description);
    }

    private _resetBuild(): void {
        this.model.clear();
        this.currentBuildName = "";
        this.header.setTitle("");
        this.description.setValue("");
        this._refreshAll();
    }

    private async _saveCurrentBuild(): Promise<void> {
        if (!this.model.perks.length) {
            new Notice(t("ui.noPerksSelected"));
            return;
        }

        const name = this.currentBuildName.trim() || DEFAULT_BUILD_NAME;
        const exists = (await this.store.getByName(name)) !== null;

        if (exists) {
            const confirmed = await this._confirmOverwrite();
            if (!confirmed) return;
        }

        try {
            await this.store.save({
                name,
                perks: [...this.model.perks],
                description: this.model.description,
            });
            this.currentBuildName = name;
            this.header.setTitle(name);
            new Notice(t("notice.buildSaved", { name }));
        } catch {
            new Notice(t("notice.buildSaveFailed"));
        }
    }

    private _confirmOverwrite(): Promise<boolean> {
        return ConfirmModal.ask(this.app, {
            title: t("modal.overwrite"),
            message: t("modal.overwriteDesc"),
            confirmText: t("modal.overwriteConfirm"),
            confirmClass: "is-primary",
        });
    }

    private async _openLoadModal(): Promise<void> {
        const builds = await this.store.list();
        new LoadBuildModal(this.app, builds, (build) => {
            this.model.clear();
            this.model.set(build.perks, build.description ?? "");
            this.currentBuildName = build.name;
            this._refreshAll();
            new Notice(t("notice.buildLoaded", { name: build.name }));
        }).open();
    }

    private async _openRenameModal(): Promise<void> {
        const name = this.currentBuildName.trim();
        if (!name) {
            new Notice(t("modal.noBuilds"));
            return;
        }

        const build = await this.store.getByName(name);
        if (!build) {
            new Notice(t("notice.buildLoadFailed"));
            return;
        }

        const newName = await RenameBuildModal.ask(this.app, build.name);
        if (newName === null) return;

        try {
            await this.store.rename(build.name, newName);
        } catch (err) {
            if (err instanceof BuildAlreadyExistsError) {
                new Notice(t("notice.buildNameTaken", { name: err.name }));
            } else {
                new Notice(t("notice.buildRenameFailed"));
            }
            return;
        }

        this.currentBuildName = newName;
        this.header.setTitle(newName);
        new Notice(t("notice.buildRenamed", { oldName: build.name, newName }));
    }

    private async _openDeleteModal(): Promise<void> {
        const name = this.currentBuildName.trim();
        if (!name) {
            new Notice(t("modal.noBuilds"));
            return;
        }

        const build = await this.store.getByName(name);
        if (!build) {
            new Notice(t("notice.buildLoadFailed"));
            return;
        }

        const confirmed = await ConfirmModal.ask(this.app, {
            title: t("ui.deleteBuild"),
            message: t("modal.confirmDelete"),
            confirmText: t("modal.delete"),
            confirmClass: "is-danger",
        });
        if (!confirmed) return;

        await this.store.delete(build);
        new Notice(t("notice.buildDeleted", { name: build.name }));
        this._resetBuild();
    }
}