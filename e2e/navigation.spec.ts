import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Dreamwell/);
    await expect(page.locator('h1').first()).toContainText('Dreamwell');
  });

  test('should navigate to all main pages from desktop sidebar', async ({ page }) => {
    // Test desktop navigation (viewport > 768px)
    await page.setViewportSize({ width: 1280, height: 720 });

    const routes = [
      { path: '/sleep-tracker', heading: 'Sleep Tracker' },
      { path: '/alarm-setup', heading: 'Alarm Setup' },
      { path: '/sleep-history', heading: 'Sleep History' },
      { path: '/sleep-notes', heading: 'Sleep Notes' },
      { path: '/insights', heading: 'Sleep Insights' },
      { path: '/sounds', heading: 'Relaxation Sounds' },
      { path: '/settings', heading: 'Settings' },
      { path: '/premium', heading: 'Premium' },
    ];

    for (const route of routes) {
      await page.click(`a[href="${route.path}"]`);
      await expect(page.locator('h1, h2').first()).toContainText(route.heading);
    }
  });

  test('should navigate using mobile bottom navigation', async ({ page }) => {
    // Test mobile navigation (viewport < 768px)
    await page.setViewportSize({ width: 375, height: 667 });

    const mobileRoutes = [
      { path: '/', label: 'Home' },
      { path: '/sleep-tracker', label: 'Track' },
      { path: '/alarm-setup', label: 'Alarm' },
      { path: '/sleep-history', label: 'History' },
      { path: '/sleep-notes', label: 'Notes' },
    ];

    for (const route of mobileRoutes) {
      await page.click(`nav a[href="${route.path}"]`);
      await expect(page).toHaveURL(route.path);
    }
  });

  test('should use skip links for keyboard navigation', async ({ page }) => {
    // Press Tab to reveal skip links
    await page.keyboard.press('Tab');

    // Check if skip link is focused
    const skipLink = page.locator('a.skip-link').first();
    await expect(skipLink).toBeFocused();

    // Press Enter to skip to main content
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('should handle 404 page', async ({ page }) => {
    await page.goto('/non-existent-page');
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('should maintain active state on navigation links', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.click('a[href="/sleep-tracker"]');
    const activeLink = page.locator('a[href="/sleep-tracker"]');
    await expect(activeLink).toHaveClass(/text-primary/);
  });
});
