import { chromium } from 'playwright-chromium';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT || 3030;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOT_DIR = path.join(process.cwd(), '.slide_check_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log(`🔍 Launching browser to check slides at ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // FloatingVue patch error is a known upstream issue in slidev twoslash client when not using twoslash
      if (text.includes('Failed to patch FloatingVue')) {
        console.warn(`[Ignored Upstream Warning] ${text}`);
        return;
      }
      consoleErrors.push(`[Console Error] ${text}`);
    }
  });

  page.on('pageerror', err => {
    // Screen Wake Lock is unsupported or denied in headless environments
    if (err.message.includes('Wake Lock')) {
      return;
    }
    pageErrors.push(`[Page Error] ${err.message}\n${err.stack}`);
  });

  page.on('requestfailed', req => {
    const errorText = req.failure()?.errorText || '';
    // Ignore aborted reactive navigation requests on page transition or favicons
    if (errorText === 'net::ERR_ABORTED' || req.url().includes('favicon.ico')) {
      return;
    }
    requestFailures.push(`[Failed Request] ${req.url()} (${errorText})`);
  });

  // 1. Visit slide 1
  console.log(`Navigating to ${BASE_URL}...`);
  try {
    await page.goto(`${BASE_URL}/1`, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    console.error(`Failed to connect to ${BASE_URL}: ${e.message}`);
    await browser.close();
    process.exit(1);
  }

  // Check Vite error overlay
  const errorOverlay = await page.$('vite-error-overlay');
  if (errorOverlay) {
    const errorText = await page.evaluate(el => el.shadowRoot?.innerHTML || el.innerHTML, errorOverlay);
    console.error(`❌ Vite Error Overlay detected:\n${errorText}`);
    pageErrors.push(`Vite Error Overlay: ${errorText}`);
  }

  // Get total slide count from DOM or navigation
  // Slidev has total slides info or we can iterate until page URL stops advancing
  let currentSlide = 1;
  const slideResults = [];

  while (true) {
    // Wait briefly for animations / renders
    await page.waitForTimeout(500);

    const url = page.url();
    const slideErrorsBefore = [...consoleErrors, ...pageErrors, ...requestFailures];

    // Take screenshot
    const screenshotPath = path.join(SCREENSHOT_DIR, `slide_${currentSlide}.png`);
    await page.screenshot({ path: screenshotPath });

    // Check overlay again
    const overlay = await page.$('vite-error-overlay');
    let hasOverlay = false;
    if (overlay) {
      hasOverlay = true;
      const text = await page.evaluate(el => el.shadowRoot?.textContent || el.textContent, overlay);
      pageErrors.push(`Slide ${currentSlide} Vite Overlay: ${text}`);
    }

    const currentErrors = [...consoleErrors, ...pageErrors, ...requestFailures].slice(slideErrorsBefore.length);
    slideResults.push({
      slide: currentSlide,
      url,
      hasOverlay,
      errors: currentErrors,
    });

    console.log(`  Slide ${currentSlide} (${url}): ${currentErrors.length === 0 && !hasOverlay ? '✅ OK' : '❌ ERROR'}`);
    if (currentErrors.length > 0) {
      currentErrors.forEach(err => console.log(`     -> ${err}`));
    }

    // Try going to next slide by pressing ArrowRight
    const prevUrl = page.url();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(400);
    const newUrl = page.url();

    // If URL didn't change, check if there's clicks left or we reached the end
    if (prevUrl === newUrl) {
      // Try a few more times in case of clicks
      let advanced = false;
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(300);
        if (page.url() !== prevUrl) {
          advanced = true;
          break;
        }
      }
      if (!advanced) {
        console.log(`Reached last slide at slide ${currentSlide}.`);
        break;
      }
    }

    currentSlide++;
    if (currentSlide > 50) {
      console.warn('Exceeded 50 slides safety limit.');
      break;
    }
  }

  await browser.close();

  const totalErrors = consoleErrors.length + pageErrors.length + requestFailures.length;
  console.log('\n======================================');
  console.log(`Total Slides Checked: ${slideResults.length}`);
  console.log(`Total Errors Detected: ${totalErrors}`);
  if (consoleErrors.length > 0) {
    console.log('\n--- Console Errors ---');
    consoleErrors.forEach(e => console.log(e));
  }
  if (pageErrors.length > 0) {
    console.log('\n--- Page Errors ---');
    pageErrors.forEach(e => console.log(e));
  }
  if (requestFailures.length > 0) {
    console.log('\n--- Request Failures ---');
    requestFailures.forEach(e => console.log(e));
  }
  console.log('======================================');

  // Clean up screenshots if clean run
  if (totalErrors === 0 && fs.existsSync(SCREENSHOT_DIR)) {
    fs.rmSync(SCREENSHOT_DIR, { recursive: true, force: true });
  }

  if (totalErrors > 0) {
    console.error('❌ Failures detected during browser inspection.');
    process.exit(1);
  } else {
    console.log('🎉 All slides rendered cleanly without errors in browser!');
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Fatal error during slide check:', err);
  process.exit(1);
});
