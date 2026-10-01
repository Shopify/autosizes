const { test, expect } = require('@playwright/test');

const testFiles = ['test.html', 'test_defer.html'];

test.describe('autosizes polyfill', () => {
  for (const testFile of testFiles) {
    test.describe(`testing ${testFile}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`http://localhost:8000/test/${testFile}`);
      });

      test('should handle basic test case', async ({ page, browserName }) => {
        const test1 = page.locator('#test1 img');
        await test1.waitFor({ state: 'visible' });
        
        // Wait for document to load
        await page.evaluate(() => new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve();
            return;
          }
          window.addEventListener('load', () => resolve());
        }));

        async function getImageCurrentSrc(page, imageId) {
          const img = page.locator(imageId);
          await img.evaluate(img => new Promise(resolve => {
            if (img.complete) resolve();
            img.onload = resolve;
          }));
          return await img.evaluate(img => img.currentSrc);
        }

        let currentSrc = await getImageCurrentSrc(page, '#img-test1');
        expect(currentSrc).not.toMatch("/1200/900");
        currentSrc = await getImageCurrentSrc(page, '#img-test2');
        expect(currentSrc).not.toMatch("/1200/900");
        currentSrc = await getImageCurrentSrc(page, '#img-test3');
        expect(currentSrc).toMatch("/1200/900");
        currentSrc = await getImageCurrentSrc(page, '#img-test4');
        expect(currentSrc).toMatch("/1200/900");
        currentSrc = await getImageCurrentSrc(page, '#img-test5');
        expect(currentSrc).not.toMatch("/1200/900");
        currentSrc = await getImageCurrentSrc(page, '#img-test6');
        expect(currentSrc).not.toMatch("/1200/900");
      });
    });
  }

  test.describe('testing test_injection.html', () => {
    test('should not load URLs from data-auto-sizes-* attributes it did not set', async ({ page }) => {
      const injectedRequests = [];
      page.on('request', (request) => {
        if (request.url().includes('/test/injected')) {
          injectedRequests.push(request.url());
        }
      });
      await page.goto('http://localhost:8000/test/test_injection.html');

      // Wait for the polyfill to restore the legitimate image after FCP
      const legitimate = page.locator('#img-legitimate');
      await expect(legitimate).toHaveAttribute('sizes', '200px');
      await expect(legitimate).toHaveAttribute('src', 'legitimate.png');
      await expect(legitimate).toHaveAttribute('srcset', 'legitimate-400.png 400w, legitimate-800.png 800w');

      for (const id of ['#img-injected', '#img-injected-lazy']) {
        const img = page.locator(id);
        expect(await img.getAttribute('src')).toBeNull();
        expect(await img.getAttribute('srcset')).toBeNull();
      }
      const mixed = page.locator('#img-injected-mixed');
      expect(await mixed.getAttribute('src')).toBeNull();
      expect(await mixed.getAttribute('srcset')).toBe('legitimate-mixed-400.png 400w');

      await page.waitForLoadState('networkidle');
      expect(injectedRequests).toEqual([]);
    });
  });
});
