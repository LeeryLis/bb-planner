import { App, PluginSettingTab, Setting } from "obsidian";
import type BBPlannerPlugin from "../../main";
import { setLocale, t } from "../../i18n";
import { FolderSuggest } from "./FolderSuggest";

export class BBPlannerSettingTab extends PluginSettingTab {
    plugin: BBPlannerPlugin;

    constructor(app: App, plugin: BBPlannerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName(t("settings.language.name"))
            .setDesc(t("settings.language.desc"))
            .addDropdown((d) =>
                d
                    .addOption("auto", t("settings.language.auto"))
                    .addOption("en", "English")
                    .addOption("ru", "Русский")
                    .setValue(this.plugin.settings.language)
                    .onChange(async (v) => {
                        this.plugin.settings.language = v as "auto" | "en" | "ru";
                        setLocale(this.plugin.settings.language);
                        await this.plugin.saveSettings();
                        this.display();
                    })
            );

        new Setting(containerEl)
            .setName(t("settings.buildsFolder.name"))
            .setDesc(t("settings.buildsFolder.desc"))
            .addText((text) => {
                text
                    .setPlaceholder("BB/Builds")
                    .setValue(this.plugin.settings.buildsFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.buildsFolder = value;
                        await this.plugin.saveSettings();
                    });

                new FolderSuggest(this.app, text.inputEl);
            });
    }
}