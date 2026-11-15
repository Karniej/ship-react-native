# App Icon & Splash Screen Generation Guide

> Proven prompts and workflow for generating professional app icons and splash screens.
> Uses Replicate API with flux-1.1-pro (icons) and nano-banana (splash screens).

---

## Quick Setup

After generating images, place them in `assets/source/`:

- `icon-source.png` — 1024x1024 square icon
- `splash-logo.png` — portrait splash screen

Then either run `npm run generate:assets` or manually copy:

```bash
cp assets/source/icon-source.png assets/icon.png
cp assets/source/icon-source.png assets/adaptive-icon.png
cp assets/source/splash-logo.png assets/splash.png
# Generate favicon
cp assets/icon.png assets/favicon.png && sips -z 48 48 assets/favicon.png
```

Update `app.json` splash backgroundColor to match your brand primary color.

---

## Icon Generation

### Model: `black-forest-labs/flux-1.1-pro` via Replicate API

**Why flux-1.1-pro:** Best quality for icons. ~8s per image. Supports exact 1024x1024 dimensions.

### Two Icon Styles

#### Style 1: Identifier Apps (Scanner Frame)

For apps that identify/scan objects (fish, snakes, jewelry, wood, etc.). Uses the "SnakeID pattern" — brand color background, realistic 3D object, white L-shaped scanner brackets in corners.

**Gold Standard Reference:** The SnakeID icon — red background, coiled snake, perfect white L-brackets.

```
A 1024x1024 square image. [BRAND_COLOR] background.
A [photorealistic/stunning realistic] 3D [OBJECT_DESCRIPTION], centered
[and floating] with soft shadow [beneath].
Four crisp white L-shaped corner brackets overlay the image in each
corner like a scanning viewfinder. The brackets are bold thick white lines.
No text no letters no words.
```

**Tips for getting good L-brackets:**

- Keep the object small/centered with lots of empty space — brackets need room
- Say "Four crisp white L-shaped corner brackets overlay the image in each corner like a scanning viewfinder. The brackets are bold thick white lines."
- Simpler objects get better brackets (the model struggles when the object fills the frame)
- May need 3-5 attempts to get clean brackets — it's the hardest element to control

**Examples that worked:**

- Snake: "A photorealistic 3D coiled red snake with detailed scales, centered with soft shadow"
- Fish: "A photorealistic 3D rainbow trout with iridescent spotted scales, centered floating with shadow"
- Paw print: "A photorealistic 3D bear paw print pressed into soft earth, centered with shadow"
- Pills: "A group of colorful 3D medicine pills and capsules in red blue white yellow, centered with shadow"
- Jewelry: "A 3D gold chain necklace with an amethyst teardrop gemstone pendant, centered with shadow"

#### Style 2: AI Tool / Concept Apps

For apps that are tools (text rewriter, book summaries, cover letter, etc.). Brand color background, realistic 3D object representing the concept, no scanner frame.

```
A 1024x1024 square image. [BRAND_COLOR] background with soft radial glow.
In the center, [3D_CONCEPT_OBJECT_DESCRIPTION].
Warm soft lighting with gentle shadow beneath.
Premium realistic 3D render quality.
No text no letters no words.
```

**Examples that worked:**

- Debate: "Two large 3D boxing gloves, one purple and one white, clashing together with a bright golden impact spark"
- Text Rewriter: "Two realistic 3D white document pages with a glowing blue magical transformation arrow between them"
- Book Summary: "A 3D open book with pages fanning out transforming into a glowing golden notepad"
- Shield/Check: "A dark metallic 3D shield with a bright glowing green checkmark"
- Cat + Brain: "A cute realistic 3D white fluffy cat face with a subtle glowing translucent brain above its head"

#### Style 3: Special Cases

Some apps need unique treatment:

- **Cat Purr (understanding cats):** Cat face + glowing brain (no scanner frame)
- **Debate:** Boxing gloves clashing with spark (aggressive, bold)
- **Humanize AI:** Half-robot half-human heart
- **Medical/Health:** Shield + magnifying glass (trustworthy, protective)

### Generation Script

```bash
# Single icon generation via Replicate API
PROMPT="your prompt here"
ESCAPED=$(python3 -c "import json,sys; print(json.dumps(sys.stdin.read().strip()))" <<< "$PROMPT")

curl -s -X POST "https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions" \
  -H "Authorization: Bearer $REPLICATE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"input\":{\"prompt\":$ESCAPED,\"width\":1024,\"height\":1024,\"output_format\":\"png\",\"safety_tolerance\":3,\"prompt_upsampling\":true}}"
```

### Common Pitfalls

- **L-brackets become arrows:** Try "crisp white L-shaped corner brackets" or "white square bracket corner markers"
- **Wrong background color:** Be explicit: "Solid [COLOR] [HEX] background" at the start of prompt
- **Text appears in image:** Always end with "No text no letters no words"
- **Object too detailed:** Simplify the object description — complex objects fight with L-brackets
- **Model ignores brackets:** Make object smaller ("small", "centered with lots of space around it")

---

## Splash Screen Generation

### Model: `google/nano-banana` via Replicate API

**Why nano-banana:** Better at text rendering and following layout instructions. ~8s per image. Good at creating clean splash screens with icon + text.

### Splash Screen Format

Portrait (9:16), solid brand color background, small icon logo in upper area, brand name in bold white text, tagline in smaller white text below.

### Prompt Template

```
A mobile app splash screen in portrait 9:16 ratio.
Flat solid [BRAND_COLOR_HEX] background.
Centered vertically: a small [EXACT_ICON_DESCRIPTION_FROM_YOUR_ICON].
Below that the word [BRAND_NAME] in large bold white sans-serif text.
Below that [TAGLINE] in smaller thin white text.
Only these three elements centered on solid [BRAND_COLOR_HEX]. Nothing else.
```

**Critical:** Describe the ACTUAL icon you generated, not a generic concept. If your icon is "two boxing gloves clashing with a golden spark," say exactly that in the splash prompt.

### Examples That Worked

```
# DebatePro
A mobile app splash screen in portrait 9:16 ratio. Flat solid #6C5CE7
background. Centered vertically: a small 3D rendering of two boxing
gloves one dark purple and one white punching each other with a bright
golden spark explosion between them. Below that the word DebatePro in
large bold white sans-serif text. Below that Sharpen Your Arguments in
smaller thin white text. Only these three elements centered on solid
purple. Nothing else.

# AICheck
A mobile app splash screen in portrait 9:16 ratio. Flat solid #00B894
background. Centered vertically: a small 3D dark metallic shield with
a bright glowing green checkmark in the center and small bolts in the
corners. Below that the word AICheck in large bold white sans-serif
text. Below that AI Content Detector in smaller thin white text. Only
these three elements centered on solid green. Nothing else.
```

### Generation Script

```bash
PROMPT="your splash prompt here"
ESCAPED=$(python3 -c "import json,sys; print(json.dumps(sys.stdin.read().strip()))" <<< "$PROMPT")

curl -s -X POST "https://api.replicate.com/v1/models/google/nano-banana/predictions" \
  -H "Authorization: Bearer $REPLICATE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"input\":{\"prompt\":$ESCAPED,\"aspect_ratio\":\"9:16\",\"output_format\":\"png\"}}"
```

### Common Pitfalls

- **Phone mockup appears:** Add "No phone mockup" explicitly
- **Icon doesn't match:** Describe the EXACT icon, not a generic concept
- **Background has gradient:** Say "Flat solid [COLOR]" not just "[COLOR] background"
- **Extra elements appear:** End with "Only these three elements... Nothing else."
- **Text is wrong:** The model may misspell brand names — check and regenerate

---

## Batch Generation

See the shell scripts in `/Volumes/DM FS510/Apps/`:

- `generate-icons-final.sh` — generates 2 icon variants per app
- `generate-splash-v2.sh` — generates splash screens for all apps
- `generate-icons-rework.sh` — reruns specific apps with updated prompts

These scripts handle polling, retries, and file management automatically.

---

## After Generation Checklist

- [ ] `assets/source/icon-source.png` — 1024x1024 final icon
- [ ] `assets/source/splash-logo.png` — portrait splash screen
- [ ] `assets/icon.png` — copy of icon-source.png
- [ ] `assets/adaptive-icon.png` — copy of icon-source.png
- [ ] `assets/splash.png` — copy of splash-logo.png
- [ ] `assets/favicon.png` — 48x48 resized from icon
- [ ] `app.json` splash.backgroundColor — matches brand primary color
- [ ] `app.json` android.adaptiveIcon.backgroundColor — matches brand primary color
