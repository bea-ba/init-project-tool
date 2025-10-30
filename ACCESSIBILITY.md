# Accessibility Documentation

This document outlines the accessibility features implemented in Dreamwell to ensure an inclusive experience for all users.

## Standards Compliance

Dreamwell aims to meet **WCAG 2.1 Level AA** standards for web accessibility.

## Implemented Features

### 1. Keyboard Navigation

- **Skip Links**: Press Tab on page load to reveal skip links to main content and navigation
- **Focus Indicators**: Clear, high-contrast focus indicators (3px solid outline) on all interactive elements
- **Tab Order**: Logical tab order following visual layout
- **Keyboard Shortcuts**: All functionality accessible via keyboard
- **Focus Management**: Focus automatically managed in modals and during navigation

### 2. Screen Reader Support

- **ARIA Landmarks**: Proper semantic structure with `<main>`, `<nav>`, `<aside>` landmarks
- **ARIA Labels**: Descriptive labels on all interactive elements
- **ARIA Live Regions**: Dynamic announcements for:
  - Sleep tracking start/stop
  - Timer updates (aria-live="off" to avoid constant announcements)
  - Success/error messages
- **Icon Labels**: All decorative icons marked with `aria-hidden="true"`
- **Button Labels**: Clear, descriptive labels (e.g., "Start sleep tracking" instead of just "Start")

### 3. Color Contrast (WCAG AA)

Enhanced color contrast ratios in dark theme:
- **Text on Background**: Minimum 4.5:1 ratio
- **Muted Text**: Enhanced from 65% to 72% lightness
- **Borders**: Enhanced from 22% to 26% lightness
- **Interactive Elements**: Enhanced primary, secondary, and accent colors

### 4. Focus Management

Custom hooks for focus management:
- `useFocusOnMount`: Automatically focuses first element on page load
- `useFocusTrap`: Traps focus within modals/dialogs
- `useFocusRestore`: Restores focus after modal closes

### 5. Semantic HTML

- Proper heading hierarchy (h1 → h2 → h3)
- Semantic elements (`<nav>`, `<main>`, `<aside>`, `<article>`)
- Form labels properly associated with inputs
- Button vs link usage (buttons for actions, links for navigation)

## Testing Recommendations

### Automated Testing

```bash
# Install accessibility testing tools
npm install -D @axe-core/cli pa11y

# Run axe-core audit
npx axe http://localhost:8080

# Run pa11y audit
npx pa11y http://localhost:8080
```

### Manual Testing

1. **Keyboard Navigation**
   - Navigate entire app using only Tab, Shift+Tab, Enter, Space, Arrow keys
   - Verify skip links appear on Tab
   - Ensure focus is always visible

2. **Screen Reader Testing**
   - **macOS**: VoiceOver (Cmd+F5)
   - **Windows**: NVDA or JAWS
   - **Mobile**: TalkBack (Android) or VoiceOver (iOS)

3. **Color Contrast**
   - Use browser DevTools color picker
   - Install Chrome extension: "WCAG Color Contrast Checker"

4. **Zoom Testing**
   - Test at 200% zoom
   - Verify no content is cut off
   - Verify all functionality remains accessible

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Navigate to next focusable element |
| Shift+Tab | Navigate to previous focusable element |
| Enter/Space | Activate buttons and links |
| Escape | Close modals and dialogs |
| Arrow Keys | Navigate within components (charts, lists) |

## Screen Reader Announcements

The app announces the following actions:
- "Sleep tracking started. Sweet dreams!"
- "Sleep tracking stopped. You slept for X hours and Y minutes. Quality score: Z%."
- Form validation errors
- Success confirmations

## Known Limitations

1. **Charts**: Recharts accessibility can be improved with data tables
2. **Animations**: Some users may prefer reduced motion (future enhancement)
3. **Touch Targets**: Minimum 44x44px on mobile (mostly compliant, some areas need improvement)

## Future Enhancements

- [ ] Add reduced motion support (`prefers-reduced-motion`)
- [ ] Add high contrast mode
- [ ] Provide data table alternatives for charts
- [ ] Add keyboard shortcuts documentation in-app
- [ ] Implement voice control support
- [ ] Add adjustable text size settings

## Reporting Issues

If you encounter accessibility issues, please report them with:
1. Description of the issue
2. Steps to reproduce
3. Assistive technology used (if applicable)
4. Browser and OS version

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
