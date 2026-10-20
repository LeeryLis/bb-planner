export const PERKS = [
    // Tier 1
    { id: "fast-adaptation", tier: 1 },
    { id: "crippling-strikes", tier: 1 },
    { id: "colossus", tier: 1 },
    { id: "nine-lives", tier: 1 },
    { id: "bags-and-belts", tier: 1 },
    { id: "pathfinder", tier: 1 },
    { id: "adrenaline", tier: 1 },
    { id: "recover", tier: 1 },
    { id: "student", tier: 1 },

    // Tier 2
    { id: "executioner", tier: 2 },
    { id: "bullseye", tier: 2 },
    { id: "dodge", tier: 2 },
    { id: "fortified-mind", tier: 2 },
    { id: "resilient", tier: 2 },
    { id: "steel-brow", tier: 2 },
    { id: "quick-hands", tier: 2 },
    { id: "gifted", tier: 2 },

    // Tier 3
    { id: "backstabber", tier: 3 },
    { id: "anticipation", tier: 3 },
    { id: "shield-expert", tier: 3 },
    { id: "brawny", tier: 3 },
    { id: "relentless", tier: 3 },
    { id: "rotation", tier: 3 },
    { id: "rally-the-troops", tier: 3 },
    { id: "taunt", tier: 3 },

    // Tier 4 - weapon masteries
    { id: "mace-mastery", tier: 4 },
    { id: "flail-mastery", tier: 4 },
    { id: "hammer-mastery", tier: 4 },
    { id: "axe-mastery", tier: 4 },
    { id: "cleaver-mastery", tier: 4 },
    { id: "sword-mastery", tier: 4 },
    { id: "dagger-mastery", tier: 4 },
    { id: "polearm-mastery", tier: 4 },
    { id: "spear-mastery", tier: 4 },
    { id: "crossbow-mastery", tier: 4 },
    { id: "bow-mastery", tier: 4 },
    { id: "throwing-mastery", tier: 4 },

    // Tier 5
    { id: "reach-advantage", tier: 5 },
    { id: "overwhelm", tier: 5 },
    { id: "lone-wolf", tier: 5 },
    { id: "underdog", tier: 5 },
    { id: "footwork", tier: 5 },

    // Tier 6
    { id: "berserk", tier: 6 },
    { id: "head-hunter", tier: 6 },
    { id: "nimble", tier: 6 },
    { id: "battle-forged", tier: 6 },

    // Tier 7
    { id: "fearsome", tier: 7 },
    { id: "duelist", tier: 7 },
    { id: "killing-frenzy", tier: 7 },
    { id: "indomitable", tier: 7 },
] as const;

export type PerkEntry = typeof PERKS[number];
export type PerkId = PerkEntry["id"];
export type PerkTier = PerkEntry["tier"];

export const PERK_ID_SET: ReadonlySet<string> = new Set(PERKS.map((p) => p.id));

export function isPerkId(value: string): value is PerkId {
    return PERK_ID_SET.has(value);
}

export function getPerkById(id: string): PerkEntry | undefined {
    return PERKS.find((p) => p.id === id);
}

export function getPerksByTier(tier: number): PerkEntry[] {
    return PERKS.filter((p) => p.tier === tier);
}

export const STUDENT_PERK_ID: PerkId = "student";
export const STUDENT_BONUS_PERKS = 1;
export const BASE_MAX_PERKS = 10;
export const MAX_TIER: PerkTier = 7;
