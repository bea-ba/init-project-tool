import { test, expect } from '@playwright/test';

test.describe('Sleep Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should start and stop sleep tracking', async ({ page }) => {
    // Navigate to sleep tracker
    await page.click('a[href="/sleep-tracker"]');
    await expect(page.locator('h1')).toContainText('Sleep Tracker');

    // Verify initial state
    await expect(page.locator('button', { hasText: 'Begin Sleep Journey' })).toBeVisible();

    // Start sleep tracking
    await page.click('button:has-text("Begin Sleep Journey")');

    // Verify tracking started
    await expect(page.locator('button', { hasText: 'Stop Tracking' })).toBeVisible();
    await expect(page.locator('text=Sleep Duration')).toBeVisible();

    // Verify timer is running (should not be 0:00:00)
    await page.waitForTimeout(2000);
    const timerText = await page.locator('p.text-5xl').textContent();
    expect(timerText).not.toBe('0:00:00');

    // Stop sleep tracking
    await page.click('button:has-text("Stop Tracking")');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/');

    // Verify session appears on dashboard
    await expect(page.locator('text=Last Sleep')).toBeVisible();
  });

  test('should persist active sleep session across page reloads', async ({ page }) => {
    await page.click('a[href="/sleep-tracker"]');
    await page.click('button:has-text("Begin Sleep Journey")');

    // Reload page
    await page.reload();

    // Verify tracking is still active
    await expect(page.locator('button', { hasText: 'Stop Tracking' })).toBeVisible();
  });

  test('should show sleep timer updating in real-time', async ({ page }) => {
    await page.click('a[href="/sleep-tracker"]');
    await page.click('button:has-text("Begin Sleep Journey")');

    const timer = page.locator('p.text-5xl');
    const initialTime = await timer.textContent();

    // Wait and check timer updated
    await page.waitForTimeout(2000);
    const updatedTime = await timer.textContent();

    expect(initialTime).not.toBe(updatedTime);
  });

  test('should announce sleep tracking events to screen readers', async ({ page }) => {
    await page.click('a[href="/sleep-tracker"]');

    // Start tracking
    await page.click('button:has-text("Begin Sleep Journey")');

    // Check for live region announcement
    const liveRegion = page.locator('[role="status"]');
    await expect(liveRegion).toContainText('Sleep tracking started');

    // Stop tracking
    await page.click('button:has-text("Stop Tracking")');
  });

  test('should display sleep quality after completing session', async ({ page }) => {
    await page.click('a[href="/sleep-tracker"]');
    await page.click('button:has-text("Begin Sleep Journey")');

    // Wait a bit to simulate sleep
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Stop Tracking")');

    // Should be on dashboard
    await expect(page).toHaveURL('/');

    // Quality score should be displayed
    await expect(page.locator('text=/Quality.*%/')).toBeVisible();
  });

  test('should handle keyboard navigation in sleep tracker', async ({ page }) => {
    await page.goto('/sleep-tracker');

    // Focus on start button using keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Skip back button

    const startButton = page.locator('button:has-text("Begin Sleep Journey")');
    await expect(startButton).toBeFocused();

    // Activate with Enter
    await page.keyboard.press('Enter');

    // Verify tracking started
    await expect(page.locator('button', { hasText: 'Stop Tracking' })).toBeVisible();
  });
});
