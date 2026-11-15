import de from "./de";
import en from "./en";
import es from "./es";
import fr from "./fr";
import it from "./it";

export const translations = {
  en,
  es,
  fr,
  de,
  it,
};

export type Language = keyof typeof translations;
export type TranslationKeys = typeof en;

export const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
];

export default translations;
