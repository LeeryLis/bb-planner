import { PerkId } from "../data/perks";

export type PerkTranslationKeys =
    | `perk.${PerkId}.name`
    | `perk.${PerkId}.desc`;

export interface TranslationKeys {
    // Plugin
    "plugin.ribbon": string;
    "plugin.openCommand": string;

    // UI - toolbar
    "ui.saveBuild": string;
    "ui.loadBuild": string;
    "ui.deleteBuild": string;
    "ui.newBuild": string;

    // UI - planner
    "ui.remaining": string;
    "ui.requiredLevel": string;
    "ui.selectedPerks": string;
    "ui.tier": string;
    "ui.noPerksSelected": string;

    // UI - description
    "ui.description": string;
    "ui.descriptionPlaceholder": string;

    // UI - modal
    "modal.buildName": string;
    "modal.save": string;
    "modal.cancel": string;
    "modal.delete": string;
    "modal.overwriteConfirm": string;
    "modal.overwrite": string;
    "modal.overwriteDesc": string;
    "modal.selectBuild": string;
    "modal.noBuilds": string;
    "modal.confirmDelete": string;
    "modal.sortAlpha": string;
    "modal.sortCreated": string;

    // Notices
    "notice.buildSaved": string;
    "notice.buildLoaded": string;
    "notice.buildDeleted": string;
    "notice.buildSaveFailed": string;
    "notice.buildLoadFailed": string;
    "notice.folderMissing": string;

    // Settings
    "settings.language.name": string;
    "settings.language.desc": string;
    "settings.language.auto": string;
    "settings.buildsFolder.name": string;
    "settings.buildsFolder.desc": string;
}