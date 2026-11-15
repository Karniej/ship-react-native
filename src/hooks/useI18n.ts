import { useCallback, useMemo } from "react";

import translations, { Language, TranslationKeys } from "@/locales";
import { useGeneralStore } from "@/store/useGeneralStore";

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}` | K
          : K
        : never;
    }[keyof T]
  : never;

type TranslationKey = NestedKeyOf<TranslationKeys>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path; // Return the key if not found
    }
  }

  return typeof result === "string" ? result : path;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;

  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return params[key]?.toString() ?? `{{${key}}}`;
  });
}

export function useI18n() {
  const { language, setLanguage } = useGeneralStore();

  const currentTranslations = useMemo(() => {
    return translations[language as Language] || translations.en;
  }, [language]);

  const t = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>): string => {
      const value = getNestedValue(currentTranslations as Record<string, unknown>, key);
      return interpolate(value, params);
    },
    [currentTranslations]
  );

  const changeLanguage = useCallback(
    (newLanguage: Language) => {
      setLanguage(newLanguage);
    },
    [setLanguage]
  );

  return {
    t,
    language: language as Language,
    changeLanguage,
    availableLanguages: Object.keys(translations) as Language[],
  };
}

// Non-hook version for use outside components
export function translate(
  language: Language,
  key: string,
  params?: Record<string, string | number>
): string {
  const currentTranslations = translations[language] || translations.en;
  const value = getNestedValue(currentTranslations as Record<string, unknown>, key);
  return interpolate(value, params);
}
