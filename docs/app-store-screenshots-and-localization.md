# App Store Screenshots & Localization Guide

> Ship your app with polished App Store screenshots and full localization — out of the box.

This guide covers two things that make or break your App Store presence:

1. **Screenshot templates** — ready-made Figma designs for all 23 starter apps
2. **Localization** — how to translate your entire app + screenshots for global markets

---

## Part 1: App Store Screenshot Templates

### What You Get

A Figma file with **276 ready-to-use screenshot frames** for all 23 apps included in ShipReactNative:

| #   | App        | Brand Color   | Hex       |
| --- | ---------- | ------------- | --------- |
| 1   | ReWordly   | Electric Blue | `#0984E3` |
| 2   | DebatePro  | Purple        | `#6C5CE7` |
| 3   | AICheck    | Emerald Green | `#00B894` |
| 4   | VoxDub     | Pink          | `#E91E63` |
| 5   | PurrSense  | Coral         | `#E17055` |
| 6   | Fishify    | Ocean Blue    | `#0077B6` |
| 7   | BookBrief  | Violet        | `#8854D0` |
| 8   | NameCraft  | Hot Pink      | `#E84393` |
| 9   | CoverWrite | Steel Blue    | `#2980B9` |
| 10  | GemSnap    | Amethyst      | `#9B59B6` |
| 11  | FontLens   | Charcoal      | `#2D3436` |
| 12  | PassSnap   | Dark Navy     | `#2C3E50` |
| 13  | TaleForge  | Deep Purple   | `#7C3AED` |
| 14  | ScatSnap   | Earth Brown   | `#8B6914` |
| 15  | MotorSnap  | Red           | `#DC2626` |
| 16  | HumanizeIt | Purple        | `#6C5CE7` |
| 17  | PillSnap   | Teal          | `#00BCD4` |
| 18  | RashCheck  | Teal          | `#14B8A6` |
| 19  | SnakeID    | Red           | `#E74C3C` |
| 20  | IrisSnap   | Emerald       | `#059669` |
| 21  | PalmSeer   | Purple        | `#7C3AED` |
| 22  | StampScan  | Navy Blue     | `#1E40AF` |
| 23  | WoodSnap   | Brown         | `#92400E` |

Each app has **6 screenshots** in **2 variants**:

- **Dark set** — black background with brand-color accents
- **Light set** — white background with brand-color accents

**Total: 23 apps × 6 screenshots × 2 variants = 276 frames**

### Screenshot Structure Per App

Each app's 6 screenshots follow this template structure:

| Frame | Template     | Layout                                | Best For                                       |
| ----- | ------------ | ------------------------------------- | ---------------------------------------------- |
| 1     | Hero         | Brand shape bg + tilted phone + title | Hero/feature screenshot — first impression     |
| 2     | LifeCalendar | Continuation of Hero phone            | Extended hero — phone content visible          |
| 3     | DeathClock   | Centered phone + title at top         | Feature detail with full phone visible         |
| 4     | StoicQuote   | Phone at top + title at bottom        | Content-focused — show the app doing its thing |
| 5     | Widgets      | Title at top + phone below            | Feature highlight with icon space              |
| 6     | Onboarding   | Title + phone + secondary content     | Multi-element layout                           |

### Text Format

Each screenshot uses a **VERB + Descriptor** pattern:

```
VERB  ←  Brand color, Poppins Bold, large
Descriptor  ←  White (dark) or Dark (light), Poppins Regular, smaller
```

Example for ReWordly:
| Frame | Verb | Descriptor |
|-------|------|------------|
| 1 | **REWRITE** | Any text instantly |
| 3 | **CHOOSE** | From 7 writing styles |
| 4 | **SUMMARIZE** | In seconds |
| 5 | **COMPARE** | Before & after |
| 6 | **SAVE** | Your rewrite history |

### How to Use the Templates

#### Step 1: Open the Figma File

Open the Figma file and navigate to the **"testy"** page. You'll see two sections:

- Top half: **Dark set** (black backgrounds)
- Bottom half: **Light set** (white backgrounds, labeled "LIGHT SET")

Apps are organized in a **2-column grid** with dark + light rows paired per app.

#### Step 2: Take Your App Screenshots

Use the iOS Simulator or a real device:

```bash
# iOS Simulator screenshot
xcrun simctl io booted screenshot ~/Desktop/screenshot.png

# Or press Cmd+S in the Simulator window
```

For best results:

- Use **iPhone 15 Pro Max** (6.7") — 1290×2796px native resolution
- Take screenshots in both **light and dark mode** if your app supports it
- Capture the exact screens mentioned in each app's screenshot plan (see [Full Screenshot Plan](#full-screenshot-plan) below)

#### Step 3: Replace Phone Screens in Figma

1. Select the frame you want to update
2. Find the phone mockup layer inside:
   - Frames 3–6: Look for `iPhone 16 Pro Max` → `Replace Image` (or the `4` rectangle inside)
   - Frames 1–2: These use the `iphone frame` rectangle (the tilted phone layout)
3. Select the screen area, then in the **Fill** section, click the image thumbnail → **Choose Image** → select your screenshot
4. Set fill mode to **Fill** (not Fit or Crop)

**Pro tip:** Also replace the small overlay rectangles named `"4"` and `"5"` at the frame's root level — these are additional screenshot slots visible around the phone edges.

#### Step 4: Export for App Store

Select all 6 frames for your app and export:

**Apple App Store:**

- Format: PNG or JPEG
- Size: The frames are 440×956 — export at **3x** to get **1320×2868** (close to the required 1290×2796 for 6.7" display)
- Or resize frames to exactly **1290×2796** before exporting at 1x

**Google Play Store:**

- Same screenshots work
- Minimum: 320px, Maximum: 3840px on any side
- 16:9 or 9:16 aspect ratio recommended

### Customizing Colors

To change an app's brand color:

1. Select all 6 frames for the app
2. Use **Find and Replace** (Edit → Find and Replace Color) in Figma
3. Replace the current brand color with your new one
4. This updates the swooping shape, text highlights, and UI accent elements

### Customizing Text

The title and subtitle are inside a component instance called `Frame 2147227504`:

1. Double-click the text to edit
2. The **verb** (first word) should be in the brand color
3. The **descriptor** (remaining words) should be white (dark set) or dark gray (light set)
4. Select the verb text → change fill to your brand color
5. Select the descriptor → change fill to `#FFFFFF` (dark) or `#1F1F24` (light)

---

## Part 2: Localization

ShipReactNative comes with a full i18n system powered by `i18n-js` + Zustand. Here's how to localize your app and screenshots for global markets.

### Architecture Overview

```
src/locales/
├── index.ts          # Exports all translations + language metadata
├── en.ts             # English (default)
├── es.ts             # Spanish
├── fr.ts             # French
├── de.ts             # German
├── it.ts             # Italian
└── useI18n.ts        # Hook for translations
```

### How It Works

```tsx
// In any component
import { useI18n } from "@/locales/useI18n";

function MyScreen() {
  const { t } = useI18n();

  return (
    <Text>{t("home.greeting", { name: "John" })}</Text>
    // Output: "Welcome back, John!"
  );
}
```

The `t()` function:

- Looks up nested keys: `t('common.save')` → `"Save"`
- Supports interpolation: `t('errors.minLength', { min: 3 })` → `"Must be at least 3 characters"`
- Falls back to English if a translation is missing
- Is fully type-safe with TypeScript

### Translation File Structure

Each language file follows this structure:

```typescript
// src/locales/en.ts
export default {
  common: {
    save: "Save",
    cancel: "Cancel",
    back: "Back",
    next: "Next",
    done: "Done",
    delete: "Delete",
    edit: "Edit",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    retry: "Retry",
  },
  auth: {
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot Password?",
    // ...
  },
  onboarding: {
    welcome: "Welcome",
    getStarted: "Get Started",
    skip: "Skip",
    // ...
  },
  home: {
    greeting: "Welcome back, {{name}}!",
    // ...
  },
  settings: {
    title: "Settings",
    language: "Language",
    theme: "Theme",
    premium: "Premium",
    // ...
  },
  premium: {
    title: "Go Premium",
    subscribe: "Subscribe",
    restore: "Restore Purchases",
    // ...
  },
  errors: {
    generic: "Something went wrong",
    network: "No internet connection",
    minLength: "Must be at least {{min}} characters",
    // ...
  },
  // ... more sections per feature
};
```

### Adding a New Language

#### 1. Create the translation file

```bash
cp src/locales/en.ts src/locales/pt.ts
```

Edit `src/locales/pt.ts` and translate all strings:

```typescript
// src/locales/pt.ts
export default {
  common: {
    save: "Salvar",
    cancel: "Cancelar",
    back: "Voltar",
    next: "Próximo",
    done: "Concluído",
    delete: "Excluir",
    edit: "Editar",
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    retry: "Tentar novamente",
  },
  // ... translate all sections
};
```

#### 2. Register it in the index file

```typescript
// src/locales/index.ts
import en from "./en";
import es from "./es";
import fr from "./fr";
import de from "./de";
import it from "./it";
import pt from "./pt"; // Add this

export const translations = { en, es, fr, de, it, pt }; // Add pt

export type Language = keyof typeof translations;

export const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" }, // Add this
] as const;
```

That's it. The language will appear in Settings automatically.

#### 3. Auto-detect device language (already built-in)

The `useI18n` hook uses `expo-localization` to detect the device language on first launch. If the user's device is set to Portuguese, the app will default to Portuguese (if available), otherwise English.

### Translating Efficiently with AI

Don't translate 500+ strings by hand. Use this workflow:

#### Option A: Claude / ChatGPT

```
Here is my English translation file for a React Native app.
Translate ALL keys to [TARGET LANGUAGE].
Keep the exact same object structure and key names.
Keep {{variables}} untranslated.
Only translate the string values.

[paste en.ts content]
```

#### Option B: Script with OpenAI API

```typescript
// scripts/translate.ts
import OpenAI from "openai";
import en from "../src/locales/en";

const openai = new OpenAI();

async function translateFile(targetLang: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Translate the following JSON values to ${targetLang}.
        Keep keys unchanged. Keep {{variables}} unchanged.
        Return valid TypeScript export default object.`,
      },
      {
        role: "user",
        content: `export default ${JSON.stringify(en, null, 2)}`,
      },
    ],
  });

  console.log(response.choices[0].message.content);
}

translateFile("Japanese");
```

#### Option C: Use an i18n Platform

For ongoing translation management:

- [Crowdin](https://crowdin.com) — free for open source
- [Lokalise](https://lokalise.com) — great API
- [Phrase](https://phrase.com) — enterprise-grade

Export your `en.ts` as JSON, upload to the platform, get translations back, convert to TypeScript.

### Localizing App Store Screenshots

This is the secret sauce. Localized screenshots increase conversion by **20-30%** in non-English markets.

#### Step 1: Create a Screenshot Text Translation File

Create a translation file for your screenshot text:

```typescript
// scripts/screenshot-texts.ts
export const screenshotTexts = {
  en: {
    ReWordly: [
      { verb: "Rewrite", desc: "Any text instantly" },
      { verb: "Choose", desc: "From 7 writing styles" },
      { verb: "Summarize", desc: "In seconds" },
      { verb: "Compare", desc: "Before & after" },
      { verb: "Save", desc: "Your rewrite history" },
    ],
    // ... other apps
  },
  es: {
    ReWordly: [
      { verb: "Reescribe", desc: "Cualquier texto al instante" },
      { verb: "Elige", desc: "Entre 7 estilos de escritura" },
      { verb: "Resume", desc: "En segundos" },
      { verb: "Compara", desc: "Antes y después" },
      { verb: "Guarda", desc: "Tu historial de reescritura" },
    ],
    // ... other apps
  },
  de: {
    ReWordly: [
      { verb: "Umschreiben", desc: "Jeden Text sofort" },
      { verb: "Wähle", desc: "Aus 7 Schreibstilen" },
      { verb: "Fasse zusammen", desc: "In Sekunden" },
      { verb: "Vergleiche", desc: "Vorher & Nachher" },
      { verb: "Speichere", desc: "Deinen Verlauf" },
    ],
    // ... other apps
  },
  // ... fr, it, pt, ja, ko, zh
};
```

#### Step 2: Duplicate Screenshot Sets in Figma

For each target language:

1. Select all 6 frames (light set recommended) for your app
2. Duplicate them (`Cmd+D`)
3. Rename: `ReWordly_Light_1` → `ReWordly_ES_1`
4. Update the verb and descriptor text with the translated versions
5. Keep the same brand colors — only the text changes

#### Step 3: Export Per Language

Export each language set separately. Name your exports:

```
screenshots/
├── en/
│   ├── screenshot_1.png
│   ├── screenshot_2.png
│   └── ...
├── es/
│   ├── screenshot_1.png
│   └── ...
├── de/
│   └── ...
└── fr/
    └── ...
```

#### Step 4: Upload to App Store Connect / Google Play Console

**Apple App Store Connect:**

1. Go to your app → App Store → select language from sidebar
2. Upload screenshots for that language
3. Each language gets its own screenshot set

**Google Play Console:**

1. Go to Store presence → Main store listing
2. Switch language tab at the top
3. Upload localized screenshots per language

### Priority Languages by Market Size

Focus your localization effort on the highest-ROI languages:

| Priority | Language             | Market                        | Why                                 |
| -------- | -------------------- | ----------------------------- | ----------------------------------- |
| 1        | English              | US, UK, AU, CA                | Default — already done              |
| 2        | Spanish              | Spain, LATAM, US Hispanic     | 500M+ speakers, huge mobile market  |
| 3        | German               | Germany, Austria, Switzerland | Highest spending per user in EU     |
| 4        | French               | France, Canada, Africa        | Large iOS market share              |
| 5        | Japanese             | Japan                         | 3rd largest app market globally     |
| 6        | Portuguese           | Brazil                        | Largest LATAM market                |
| 7        | Korean               | South Korea                   | Very high ARPU                      |
| 8        | Chinese (Simplified) | China (Android only)          | Massive scale if you target Android |
| 9        | Italian              | Italy                         | Solid EU market                     |
| 10       | Dutch                | Netherlands, Belgium          | High GDP per capita                 |

### Quick Localization Checklist

- [ ] Translate `src/locales/` files for target languages
- [ ] Register new languages in `src/locales/index.ts`
- [ ] Test RTL layout if adding Arabic/Hebrew (Expo supports RTL via `I18nManager`)
- [ ] Translate App Store metadata (title, subtitle, description, keywords)
- [ ] Create localized screenshot sets in Figma
- [ ] Export and upload screenshots per language
- [ ] Set primary language in App Store Connect
- [ ] Add all supported languages in App Store Connect / Play Console
- [ ] Test the app with each language set on a real device
- [ ] Verify date/number formatting with `expo-localization`

### App Store Metadata Localization

Don't forget — screenshots are just one part. Also localize:

```
App Name:        30 characters max (iOS) / 50 (Android)
Subtitle:        30 characters max (iOS only)
Description:     4000 characters max
Keywords:        100 characters (iOS, comma-separated)
What's New:      4000 characters max
```

Use the same AI translation workflow:

```
Translate the following App Store metadata to [LANGUAGE].
Keep it natural and compelling — this is marketing copy, not documentation.
Respect character limits noted in brackets.

App Name [30 chars]: "ReWordly: AI Text Rewriter"
Subtitle [30 chars]: "Rewrite, summarize & expand"
Keywords [100 chars]: "rewrite,text,ai,rewriter,summarize,expand,paraphrase,writing,styles"
Description: [paste your description]
```

---

## Tips & Best Practices

### Screenshots That Convert

1. **First screenshot is everything** — 60%+ of users never swipe past it. Make it count.
2. **Show the app, not the UI** — People want to see what the app DOES, not what it looks like.
3. **One benefit per screenshot** — Don't cram multiple features into one frame.
4. **Use the VERB pattern** — Action verbs ("Identify", "Track", "Save") are more compelling than nouns.
5. **Dark mode screenshots** tend to perform better for utility/productivity apps.
6. **Light mode screenshots** tend to perform better for lifestyle/health/social apps.
7. **Test both** — A/B test dark vs light with App Store Connect's product page optimization.

### Localization That Converts

1. **Don't just translate — localize.** "Get Started" in Japanese is not a literal translation; it's a culturally appropriate CTA.
2. **Screenshots matter more than description.** Most users never read the description. Localized screenshots alone can increase installs 20-30%.
3. **Keywords are language-specific.** Research ASO keywords in each target language separately.
4. **German text is 30% longer than English.** Check that translations fit in your UI and screenshot text areas.
5. **Start with 3 languages** (English + 2 high-value), measure impact, then expand.
