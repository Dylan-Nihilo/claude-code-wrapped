// PNG export module using Puppeteer
import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Export HTML file to PNG
 */
export async function exportToPNG(htmlPath: string): Promise<string> {
  const outputPath = path.join(
    os.homedir(),
    `claude-code-wrapped-2025-${Date.now()}.png`
  );

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set viewport for high-quality output
    await page.setViewport({
      width: 1200,
      height: 1800,
      deviceScaleFactor: 2,
    });

    // Navigate to the HTML file
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0',
    });

    // Hide the export button for screenshot
    await page.evaluate(() => {
      const btn = document.querySelector('.export-btn');
      if (btn) (btn as HTMLElement).style.display = 'none';

      // Disable animations for clean screenshot
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
        }
        .crt::before, .crt::after, .scan-line {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    });

    // Wait a bit for fonts to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get the content element dimensions
    const contentElement = await page.$('#wrapped-content');
    if (!contentElement) {
      throw new Error('Could not find wrapped content element');
    }

    const boundingBox = await contentElement.boundingBox();
    if (!boundingBox) {
      throw new Error('Could not get content dimensions');
    }

    // Take screenshot of the full page
    await page.screenshot({
      path: outputPath,
      fullPage: true,
      type: 'png',
    });

    return outputPath;
  } finally {
    await browser.close();
  }
}

/**
 * Check if Puppeteer is available
 */
export async function checkPuppeteerAvailable(): Promise<boolean> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    await browser.close();
    return true;
  } catch {
    return false;
  }
}
