import type { PerkTranslationKeys, TranslationKeys } from "./types";
import { en } from "./en";
import { ru } from "./ru";

type Locale = "en" | "ru";

const DICTS: Record<Locale, TranslationKeys & Record<PerkTranslationKeys, string>> = { en, ru };

let currentLocale: Locale = "en";

function detectObsidianLocale(): Locale {
    try {
        const raw = window.localStorage.getItem("language") ?? "en";
        const short = raw.split("-")[0].toLowerCase();
        return short === "ru" ? "ru" : "en";
    } catch {
        return "en";
    }
}

export function setLocale(locale: "auto" | Locale): void {
    if (locale === "auto") {
        currentLocale = detectObsidianLocale();
    } else {
        currentLocale = locale;
    }
}

export function getLocale(): Locale {
    return currentLocale;
}

export function t(
    key: keyof TranslationKeys | PerkTranslationKeys,
    vars?: Record<string, string | number>
): string {
    const dict = DICTS[currentLocale] ?? DICTS.en;
    let str = dict[key] ?? key;

    if (vars) {
        for (const [k, v] of Object.entries(vars)) {
            str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
    }
    return str;
}