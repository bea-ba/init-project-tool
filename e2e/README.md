# E2E Testing Documentation

This directory contains End-to-End (E2E) tests for Dreamwell using Playwright.

## Test Structure

```
e2e/
├── navigation.spec.ts      # Navigation and routing tests
├── sleep-tracking.spec.ts  # Sleep tracking flow tests
├── alarms.spec.ts          # Alarm setup and management tests
├── sleep-notes.spec.ts     # Sleep notes creation and editing tests
├── accessibility.spec.ts   # WCAG 2.1 AA accessibility tests
├── pwa.spec.ts            # PWA and offline functionality tests
├── integration.spec.ts     # Complete user journey tests
└── README.md              # This file
```

## Running Tests

### Prerequisites

```bash
# Install dependencies (if not already done)
npm install

# Install Playwright browsers
npx playwright install
```

### Run All Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug
```

### Run Specific Tests

```bash
# Run specific test file
npx playwright test navigation.spec.ts

# Run specific test by name
npx playwright test -g "should start and stop sleep tracking"

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### View Test Reports

```bash
# Show last test report
npm run test:e2e:report

# Reports are saved in playwright-report/
```

## Test Categories

### 1. Navigation Tests (`navigation.spec.ts`)
- Desktop sidebar navigation
- Mobile bottom navigation
- Skip links for accessibility
- 404 page handling
- Active link states

### 2. Sleep Tracking Tests (`sleep-tracking.spec.ts`)
- Start and stop tracking
- Timer updates in real-time
- Session persistence
- Screen reader announcements
- Keyboard navigation
- Quality score calculation

### 3. Alarm Tests (`alarms.spec.ts`)
- Create new alarms
- Toggle alarms on/off
- Alarm persistence
- Configuration settings
- Time format display
- Keyboard navigation

### 4. Sleep Notes Tests (`sleep-notes.spec.ts`)
- Create notes with activities
- Edit existing notes
- View notes history
- Activity tracking (exercise, caffeine, etc.)
- Note persistence
- Date/time display

### 5. Accessibility Tests (`accessibility.spec.ts`)
- WCAG 2.1 Level AA compliance
- Focus indicators
- ARIA landmarks
- Skip links
- Heading hierarchy
- Alt text for images
- Form labels
- Color contrast
- Screen reader support

### 6. PWA Tests (`pwa.spec.ts`)
- Service worker registration
- Manifest.json validation
- Meta tags
- App icons
- Offline functionality
- Asset caching
- Install prompt
- localStorage persistence

### 7. Integration Tests (`integration.spec.ts`)
- Complete user journey
- Onboarding flow
- Data persistence across sessions
- Responsive design transitions
- Error handling
- Keyboard-only navigation
- Theme persistence
- Performance metrics

## Test Configuration

Tests are configured in `playwright.config.ts`:

- **Base URL**: `http://localhost:8080`
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Retries**: 2 on CI, 0 locally
- **Timeout**: 30s per test
- **Workers**: Parallel execution
- **Artifacts**: Screenshots, videos, traces on failure

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await page.click('button');
    await expect(page.locator('h1')).toContainText('Expected Text');
  });
});
```

### Accessibility Testing

```typescript
import AxeBuilder from '@axe-core/playwright';

test('should be accessible', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Testing Offline Functionality

```typescript
test('should work offline', async ({ page, context }) => {
  await page.goto('/');
  await context.setOffline(true);

  // Test offline functionality
  await page.click('a[href="/sleep-tracker"]');
  await expect(page.locator('h1')).toBeVisible();

  await context.setOffline(false);
});
```

## Best Practices

1. **Clear localStorage** before each test for isolation
2. **Use data-testid** attributes for stable selectors
3. **Wait for network idle** when testing PWA features
4. **Test both desktop and mobile** viewports
5. **Include accessibility tests** for new features
6. **Test keyboard navigation** for all interactive elements
7. **Verify screen reader announcements** with ARIA live regions
8. **Test offline scenarios** for PWA features

## CI/CD Integration

Tests run automatically on:
- Push to `main`, `develop`, or `claude/**` branches
- Pull requests to `main` or `develop`

See `.github/workflows/e2e-tests.yml` for configuration.

## Debugging Failed Tests

### View Screenshots

```bash
# Screenshots saved in test-results/
ls test-results/
```

### View Video Recordings

```bash
# Videos saved in test-results/ (on failure)
```

### View Trace

```bash
# Open trace viewer
npx playwright show-trace test-results/trace.zip
```

### Use Code Generator

```bash
# Generate test code interactively
npm run test:e2e:codegen
```

## Common Issues

### Port Already in Use

If port 8080 is in use:
```bash
# Kill process using port 8080
npx kill-port 8080

# Or change port in playwright.config.ts
```

### Timeout Errors

Increase timeout in test:
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

### Flaky Tests

- Add explicit waits: `await page.waitForTimeout(100)`
- Use `waitForLoadState`: `await page.waitForLoadState('networkidle')`
- Increase retries in config

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Axe Accessibility Testing](https://www.deque.com/axe/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
