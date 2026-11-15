# Source Assets

Place your source images here for generating app icons and splash screens.

## icon-source.png

- Square image for your app icon
- Recommended size: 1024x1024 pixels
- PNG format with transparency (optional)
- Will be used to generate all icon sizes

**Tips:**

- Use a simple, recognizable design
- Ensure visibility at small sizes (48px)
- Avoid fine details that won't scale well

## splash-logo.png

- Your app logo for the splash screen
- Any size (will be scaled appropriately)
- PNG format with transparency recommended
- Will be centered on the splash screen background

**Tips:**

- Use your logo without text background
- Keep it simple for faster loading
- Match your brand guidelines

## Running the Generator

```bash
npm run generate:assets
```

The script will:

1. Generate all required icon sizes (icon.png, adaptive-icon.png, favicon.png)
2. Create splash screen with your logo centered
3. Optionally generate platform-specific sizes

## Generated Assets

| Asset             | Size      | Usage                 |
| ----------------- | --------- | --------------------- |
| icon.png          | 1024x1024 | Main app icon (Expo)  |
| adaptive-icon.png | 1024x1024 | Android adaptive icon |
| favicon.png       | 48x48     | Web favicon           |
| splash.png        | 1284x2778 | Default splash screen |

## Platform-Specific Assets (Optional)

If you select "Include all sizes", additional platform-specific icons are generated:

**iOS:**

- icon-20.png through icon-1024.png

**Android:**

- icon-mdpi.png through icon-xxxhdpi.png

These are useful if you need manual control over platform assets.
