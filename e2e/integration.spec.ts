import { test, expect } from '@playwright/test';

test.describe('Complete User Journey Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('complete user journey: onboarding → tracking → notes → insights', async ({ page }) => {
    // 1. First visit - should see onboarding modal (if new user)
    await page.goto('/');

    const onboardingModal = page.locator('text=/Welcome to Dreamwell|Get Started/i');
    if (await onboardingModal.isVisible({ timeout: 2000 })) {
      // Complete onboarding
      const nextButton = page.locator('button:has-text("Next")');
      while (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }

      // Finish onboarding
      const finishButton = page.locator('button:has-text(/Get Started|Finish/)');
      if (await finishButton.isVisible()) {
        await finishButton.click();
      }
    }

    // 2. Start sleep tracking
    await page.click('a[href="/sleep-tracker"]');
    await expect(page.locator('h1')).toContainText('Sleep Tracker');

    await page.click('button:has-text("Begin Sleep Journey")');
    await expect(page.locator('button:has-text("Stop Tracking")')).toBeVisible();

    // Wait a bit to simulate sleep
    await page.waitForTimeout(3000);

    // 3. Stop tracking
    await page.click('button:has-text("Stop Tracking")');
    await expect(page).toHaveURL('/');

    // 4. Verify session appears on dashboard
    await expect(page.locator('text=Last Sleep')).toBeVisible();

    // 5. Add a sleep note
    await page.click('a[href="/sleep-notes"]');

    const noteTextarea = page.locator('textarea');
    if (await noteTextarea.isVisible()) {
      await noteTextarea.fill('Great sleep! Woke up feeling refreshed.');

      // Check some activities
      const checkboxes = page.locator('input[type="checkbox"]');
      if (await checkboxes.first().isVisible()) {
        await checkboxes.first().check();
      }

      const saveButton = page.locator('button:has-text("Save")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(1000);
      }
    }

    // 6. Set up an alarm
    await page.click('a[href="/alarm-setup"]');

    const timeInput = page.locator('input[type="time"]').first();
    if (await timeInput.isVisible()) {
      await timeInput.fill('07:00');
    }

    // 7. Check insights
    await page.click('a[href="/insights"]');
    await expect(page.locator('h1, h2')).toContainText(/Insights|Analytics/);

    // Should have some data now
    await expect(page.locator('text=/Quality|Duration|Score/')).toBeVisible();

    // 8. Adjust settings
    await page.click('a[href="/settings"]');
    await expect(page.locator('h1')).toContainText('Settings');

    // 9. Return to dashboard
    await page.click('a[href="/"]');
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Verify the complete journey is reflected in dashboard
    await expect(page.locator('text=Last Sleep')).toBeVisible();
  });

  test('data persistence across sessions', async ({ page }) => {
    // Create data
    await page.goto('/sleep-tracker');
    await page.click('button:has-text("Begin Sleep Journey")');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Stop Tracking")');

    // Get session ID or data
    const sessionData = await page.evaluate(() => {
      return localStorage.getItem('dreamwell_sessions');
    });

    expect(sessionData).toBeTruthy();

    // Simulate closing and reopening the app
    await page.close();

    // Open new page with same context
    const newPage = await page.context().newPage();
    await newPage.goto('/');

    // Data should still be there
    const persistedData = await newPage.evaluate(() => {
      return localStorage.getItem('dreamwell_sessions');
    });

    expect(persistedData).toBe(sessionData);
  });

  test('responsive design: mobile to desktop transition', async ({ page }) => {
    // Start with mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check mobile navigation is visible
    const mobileNav = page.locator('nav.md\\:hidden');
    await expect(mobileNav).toBeVisible();

    // Change to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    // Check desktop sidebar is visible
    const desktopSidebar = page.locator('aside.hidden.md\\:flex');
    await expect(desktopSidebar).toBeVisible();

    // Mobile nav should be hidden
    await expect(mobileNav).not.toBeVisible();
  });

  test('error handling and recovery', async ({ page }) => {
    await page.goto('/');

    // Test 404 page
    await page.goto('/nonexistent-page');
    await expect(page.locator('text=404')).toBeVisible();

    // Should have a way to get back home
    const homeButton = page.locator('a[href="/"], button:has-text("Home")');
    await expect(homeButton).toBeVisible();
  });

  test('keyboard-only navigation through entire app', async ({ page }) => {
    await page.goto('/');

    // Use only keyboard to navigate
    let currentUrl = page.url();

    // Tab to skip link
    await page.keyboard.press('Tab');

    // Tab to first navigation item
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Press Enter to navigate
    await page.keyboard.press('Enter');

    // URL should have changed
    await page.waitForTimeout(500);
    const newUrl = page.url();

    expect(newUrl).not.toBe(currentUrl);
  });

  test('theme persistence and switching', async ({ page }) => {
    await page.goto('/settings');

    // Find theme toggle
    const themeToggle = page.locator('text=/Theme|Dark Mode|Light Mode/i');

    if (await themeToggle.isVisible()) {
      // Get current theme
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });

      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(500);

      // Verify theme changed
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });

      expect(newTheme).not.toBe(initialTheme);

      // Reload and verify persistence
      await page.reload();

      const persistedTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });

      expect(persistedTheme).toBe(newTheme);
    }
  });

  test('performance: page load times', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Check for code splitting - should have multiple script tags
    const scripts = await page.locator('script[src]').count();
    expect(scripts).toBeGreaterThan(1);
  });
});
