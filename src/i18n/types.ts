import { PerkId } from "../data/perks";

export type PerkTranslationKeys =
    | `perk.${PerkId}.name`
    | `perk.${PerkId}.desc`;

export interface TranslationKeys {
    "plugin.ribbon": string;
    "plugin.openCommand": string;

    "ui.saveBuild": string;
    "ui.loadBuild": string;
    "ui.deleteBuild": string;
    "ui.newBuild": string;
    "ui.renameBuild": string;

    "ui.remaining": string;
    "ui.requiredLevel": string;
    "ui.selectedPerks": string;
    "ui.tier": string;
    "ui.noPerksSelected": string;

    "ui.description": string;
    "ui.descriptionPlaceholder": string;

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
    "modal.renameBuild": string;
    "modal.renameConfirm": string;

    "notice.buildSaved": string;
    "notice.buildLoaded": string;
    "notice.buildDeleted": string;
    "notice.buildSaveFailed": string;
    "notice.buildLoadFailed": string;
    "notice.folderMissing": string;
    "notice.buildRenamed": string;
    "notice.buildRenameFailed": string;
    "notice.buildNameTaken": string;

    "settings.language.name": string;
    "settings.language.desc": string;
    "settings.language.auto": string;
    "settings.buildsFolder.name": string;
    "settings.buildsFolder.desc": string;
    "settings.buildsIndexName.name": string;
    "settings.buildsIndexName.desc": string;
}