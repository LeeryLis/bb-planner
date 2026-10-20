import {
    PerkId,
    PerkTier,
    BASE_MAX_PERKS,
    STUDENT_BONUS_PERKS,
    STUDENT_PERK_ID,
    MAX_TIER,
} from "../data/perks";

export const PERK_STATE = {
    Selected: "selected",
    Available: "available",
    Locked: "locked"
}

export type PerkState = typeof PERK_STATE[keyof typeof PERK_STATE];

export class BuildModel {
    private _perks: PerkId[] = [];
    private _description = "";

    get description(): string {
        return this._description;
    }

    setDescription(text: string): void {
        this._description = text;
    }

    get perks(): readonly PerkId[] {
        return this._perks;
    }

    get selectedCount(): number {
        return this._perks.length;
    }

    get maxPerks(): number {
        return BASE_MAX_PERKS + (this.has(STUDENT_PERK_ID) ? STUDENT_BONUS_PERKS : 0);
    }

    get remaining(): number {
        return this.maxPerks - this._perks.length;
    }

    get maxAvailableTier(): number {
        return Math.min(this._perks.length + 1, MAX_TIER);
    }

    getPerkState(id: PerkId, tier: PerkTier): PerkState {
        if (this.has(id)) return PERK_STATE.Selected;
        return this.canSelect(id, tier) ? PERK_STATE.Available : PERK_STATE.Locked;
    }

    has(id: PerkId): boolean {
        return this._perks.includes(id);
    }

    canSelect(id: PerkId, tier: PerkTier): boolean {
        if (this.has(id)) return true;
        if (id === "student") return true;
        if (this.selectedCount >= this.maxPerks) return false;
        if (tier > this.maxAvailableTier) return false;
        return true;
    }

    toggle(id: PerkId, tier: PerkTier): boolean {
        if (this.has(id)) {
            this._perks = this._perks.filter((p) => p !== id);
            return true;
        }
        if (!this.canSelect(id, tier)) return false;
        this._perks.push(id);
        return true;
    }

    clear(): void {
        this._perks = [];
        this._description = "";
    }

    set(perks: PerkId[], description = ""): void {
        this._perks = [...perks];
        this._description = description;
    }
}