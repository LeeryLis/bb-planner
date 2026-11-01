import { PerkId } from "./data/perks";

export interface BBPlannerSettings {
    language: "auto" | "en" | "ru";
    buildsFolder: string;
    buildsIndexName: string;
}

export const DEFAULT_SETTINGS: BBPlannerSettings = {
    language: "auto",
    buildsFolder: "BB/Builds",
    buildsIndexName: "Builds",
};

export interface Build {
    name: string;
    perks: PerkId[];
    description?: string;
    createdAt?: number;
}