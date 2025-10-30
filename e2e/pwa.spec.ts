import { test, expect } from '@playwright/test';

test.describe('PWA Features', () => {
  test('should register service worker', async ({ page }) => {
    await page.goto('/');

    // Wait for service worker registration
    const serviceWorkerRegistered = await page.evaluate(async () => {
      // Wait up to 5 seconds for service worker
      for (let i = 0; i < 50; i++) {
        if (navigator.serviceWorker.controller) {
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return !!navigator.serviceWorker.controller;
    });

    expect(serviceWorkerRegistered).toBeTruthy();
  });

  test('should have manifest.json', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('start_url');
    expect(manifest).toHaveProperty('display');
    expect(manifest).toHaveProperty('theme_color');
    expect(manifest).toHaveProperty('background_color');
    expect(manifest).toHaveProperty('icons');
  });

  test('should have proper meta tags for PWA', async ({ page }) => {
    await page.goto('/');

    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');

    // Check theme color
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveCount(1);

    // Check manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
  });

  test('should have app icons', async ({ page }) => {
    await page.goto('/');

    // Check for apple touch icon
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    const count = await appleTouchIcon.count();

    // Should have at least one icon
    expect(count).toBeGreaterThan(0);
  });

  test('should work offline after first load', async ({ page, context }) => {
    // First, load the page online to cache it
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for service worker to be active
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Navigate to another page
    await page.goto('/sleep-tracker');

    // Page should still load (from cache)
    await expect(page.locator('h1')).toContainText('Sleep Tracker');

    // Go back online
    await context.setOffline(false);
  });

  test('should cache static assets', async ({ page }) => {
    await page.goto('/');

    // Check if service worker has cached assets
    const cacheNames = await page.evaluate(async () => {
      const names = await caches.keys();
      return names;
    });

    expect(cacheNames.length).toBeGreaterThan(0);
  });

  test('should show install prompt on desktop', async ({ page, browserName }) => {
    // Skip on mobile browsers
    if (browserName === 'webkit') {
      test.skip();
    }

    await page.goto('/');

    // Check if PWA install prompt component exists
    const installPrompt = page.locator('text=/Install.*App|Add to Home/i');

    // Component should exist even if not visible
    const exists = await installPrompt.count() > 0;
    expect(exists).toBeTruthy();
  });

  test('should persist data in localStorage offline', async ({ page, context }) => {
    await page.goto('/');

    // Add some data
    await page.evaluate(() => {
      localStorage.setItem('dreamwell_test', 'test_value');
    });

    // Go offline
    await context.setOffline(true);

    // Data should still be available
    const value = await page.evaluate(() => {
      return localStorage.getItem('dreamwell_test');
    });

    expect(value).toBe('test_value');

    // Cleanup
    await page.evaluate(() => {
      localStorage.removeItem('dreamwell_test');
    });
  });

  test('should handle offline sleep tracking', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Navigate to sleep tracker
    await page.click('a[href="/sleep-tracker"]');

    // Should still work offline
    await expect(page.locator('h1')).toContainText('Sleep Tracker');

    // Start tracking
    const startButton = page.locator('button:has-text("Begin Sleep Journey")');
    if (await startButton.isVisible()) {
      await startButton.click();

      // Should work offline
      await expect(page.locator('button:has-text("Stop Tracking")')).toBeVisible();
    }

    // Go back online
    await context.setOffline(false);
  });

  test('should display app name in manifest', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    const manifest = await response?.json();

    expect(manifest.name).toBe('Dreamwell');
    expect(manifest.short_name).toBe('Dreamwell');
  });
});
