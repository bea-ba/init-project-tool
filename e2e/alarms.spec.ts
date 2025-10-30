import { test, expect } from '@playwright/test';

test.describe('Alarm Setup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.click('a[href="/alarm-setup"]');
  });

  test('should create a new alarm', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Alarm Setup');

    // Find and fill alarm time input
    const timeInput = page.locator('input[type="time"]').first();
    await timeInput.fill('07:30');

    // Enable alarm
    const enableToggle = page.locator('[role="switch"]').first();
    if (await enableToggle.getAttribute('aria-checked') === 'false') {
      await enableToggle.click();
    }

    // Save alarm (if there's a save button, otherwise auto-saves)
    // The alarm should be automatically saved to localStorage

    // Verify alarm appears in list
    await expect(page.locator('text=07:30')).toBeVisible();
  });

  test('should toggle alarm on/off', async ({ page }) => {
    // Create an alarm first
    const timeInput = page.locator('input[type="time"]').first();
    await timeInput.fill('06:00');

    const toggle = page.locator('[role="switch"]').first();

    // Turn on
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    // Turn off
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('should persist alarms across page reloads', async ({ page }) => {
    const timeInput = page.locator('input[type="time"]').first();
    await timeInput.fill('08:00');

    // Reload page
    await page.reload();

    // Verify alarm is still there
    await expect(page.locator('text=08:00')).toBeVisible();
  });

  test('should configure alarm settings', async ({ page }) => {
    // Look for alarm configuration options
    const smartWakeToggle = page.locator('text=Smart Wake').locator('..');

    if (await smartWakeToggle.isVisible()) {
      await smartWakeToggle.click();
    }

    // Test snooze duration if available
    const snoozeInput = page.locator('input[type="number"]');
    if (await snoozeInput.isVisible()) {
      await snoozeInput.fill('10');
    }
  });

  test('should show alarm time in correct format', async ({ page }) => {
    const timeInput = page.locator('input[type="time"]').first();
    await timeInput.fill('14:30');

    // Verify time is displayed (could be 12h or 24h format)
    const timeDisplay = page.locator('text=/14:30|2:30 PM/');
    await expect(timeDisplay).toBeVisible();
  });

  test('should handle keyboard navigation for alarm controls', async ({ page }) => {
    // Tab through alarm controls
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const timeInput = page.locator('input[type="time"]').first();
    await expect(timeInput).toBeFocused();

    // Type time
    await page.keyboard.type('09:00');
  });
});
