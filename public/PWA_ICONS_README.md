# PWA Icons Setup

The PWA manifest references two icon files that need to be created:

- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

## How to Create Icons

1. **Design your icon** - Create a square icon representing your app (Dreamwell sleep tracker)
2. **Export in multiple sizes**:
   - 192x192px for standard displays
   - 512x512px for high-resolution displays
3. **Place files** in the `/public` directory
4. **File format**: PNG with transparent background (recommended)

## Icon Recommendations

- Use the app's primary color (#6366f1 indigo)
- Include a recognizable symbol (moon, stars, sleep-related imagery)
- Keep it simple and readable at small sizes
- Ensure good contrast for both light and dark backgrounds

## Tools for Icon Generation

- **Figma/Sketch**: Design custom icons
- **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
- **Favicon.io**: https://favicon.io/
- **RealFaviconGenerator**: https://realfavicongenerator.net/

## Temporary Solution

Until you create custom icons, you can:
1. Use a generic icon placeholder
2. Use your logo if available
3. Use an emoji-based icon (convert emoji to PNG)

The app will work without icons, but the install experience will be less polished.
