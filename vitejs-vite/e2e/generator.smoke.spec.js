import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const heroBase64 = fs
  .readFileSync(path.resolve(__dirname, '../src/assets/hero.png'))
  .toString('base64');

test.beforeEach(async ({ page }) => {
  await page.route(
    '**/models/gemini-2.5-flash:generateContent?key=*',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      style: '測試霓虹塗鴉',
                      texts: ['準時下班', '先躺一下', '又改需求', '已讀裝死'],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      });
    }
  );

  await page.route(
    '**/models/gemini-3.1-flash-image-preview:generateContent?key=*',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    inlineData: {
                      mimeType: 'image/png',
                      data: heroBase64,
                    },
                  },
                ],
              },
            },
          ],
        }),
      });
    }
  );
});

test('generator flow can be verified without manual upload', async ({ page }) => {
  await page.goto('/?lab=1&e2e=1');

  await page.getByTestId('load-demo-source-button').click();
  await expect(page.getByText('hero')).toBeVisible();
  await expect(page.getByTestId('theme-input')).toHaveValue('厭世上班族');

  await page.getByTestId('generate-copy-button').click();
  await expect(page.getByTestId('style-input')).toHaveValue('測試霓虹塗鴉');
  await expect(page.getByTestId('sticker-text-0')).toHaveValue('準時下班');
  await expect(page.getByTestId('sticker-text-3')).toHaveValue('已讀裝死');

  await page.getByTestId('start-generation-button').click();
  await expect(page.getByTestId('generated-grid')).toBeVisible();

  await page.getByTestId('split-grid-button').click();
  await expect(page.getByTestId('split-sticker-0')).toBeVisible();
  await expect(page.getByTestId('split-sticker-3')).toBeVisible();
});
