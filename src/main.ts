import { Plugin, WorkspaceLeaf } from "obsidian";
import { PlannerView, VIEW_TYPE_BB_PLANNER } from "./ui/views/PlannerView";
import { BBPlannerSettingTab } from "./ui/settings/BBPlannerSettingTab";
import { BuildStore } from "./models/BuildStore";
import { setLocale, t } from "./i18n";
import { BBPlannerSettings, DEFAULT_SETTINGS } from "./types";

export default class BBPlannerPlugin extends Plugin {
    settings!: BBPlannerSettings;
    private store!: BuildStore;

    async onload(): Promise<void> {
        await this.loadSettings();
        setLocale(this.settings.language);

        this.store = new BuildStore(this.app, () => this.settings.buildsFolder);

        this.registerView(
            VIEW_TYPE_BB_PLANNER,
            (leaf: WorkspaceLeaf) =>
                new PlannerView(leaf, this.store)
        );

        this.addRibbonIcon("swords", t("plugin.ribbon"), () => {
            void this.activateView();
        });

        this.addCommand({
            id: "open-bb-planner",
            name: t("plugin.openCommand"),
            callback: () => void this.activateView(),
        });

        this.addSettingTab(new BBPlannerSettingTab(this.app, this));
    }

    async onunload(): Promise<void> {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_BB_PLANNER);
    }

    private async activateView(): Promise<void> {
        const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_BB_PLANNER);
        if (existing.length) {
            void this.app.workspace.revealLeaf(existing[0]);
            return;
        }

        const leaf = this.app.workspace.getLeaf("tab");
        await leaf.setViewState({ type: VIEW_TYPE_BB_PLANNER, active: true });
        void this.app.workspace.revealLeaf(leaf);
    }

    async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }
}