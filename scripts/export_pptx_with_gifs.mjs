import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createServer, resolveOptions, parser } from '@slidev/cli';
import { chromium } from 'playwright-chromium';
import PptxGenJS from 'pptxgenjs';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const SLIDES_DIR = path.join(DIST_DIR, 'slides');
const GIFS_DIR = path.join(DIST_DIR, 'gifs');
const OUTPUT_PPTX = path.join(DIST_DIR, 'slides.pptx');
const SLIDES_MD = path.join(ROOT_DIR, 'slides.md');

// PowerPoint 16:9 standard dimensions in inches
const SLIDE_WIDTH_INCHES = 10.0;
const SLIDE_HEIGHT_INCHES = 5.625;

function checkFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function convertVideoToGif(inputVideoPath, outputGifPath) {
  // Check cache: skip conversion if output is newer than input
  if (
    fs.existsSync(outputGifPath) &&
    fs.statSync(outputGifPath).mtimeMs >= fs.statSync(inputVideoPath).mtimeMs
  ) {
    console.log(`  ⚡ Using cached GIF: ${path.basename(outputGifPath)}`);
    return outputGifPath;
  }

  console.log(`  🎞️ Converting ${path.basename(inputVideoPath)} -> ${path.basename(outputGifPath)}...`);
  // 12fps, scale 480px width, 128 colors palette for compact size & smooth loop
  const cmd = `ffmpeg -y -i "${inputVideoPath}" -vf "fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${outputGifPath}"`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    const sizeMb = (fs.statSync(outputGifPath).size / (1024 * 1024)).toFixed(2);
    console.log(`  ✓ Converted (${sizeMb} MB)`);
    return outputGifPath;
  } catch (err) {
    console.warn(`  ❌ Failed to convert video to GIF: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting Universal PPTX Export (with dynamic video GIF overlay)...');

  // 1. Prepare directories
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.mkdirSync(SLIDES_DIR, { recursive: true });
  fs.mkdirSync(GIFS_DIR, { recursive: true });

  const hasFfmpeg = checkFfmpeg();
  if (!hasFfmpeg) {
    console.warn('⚠️  ffmpeg is not found in PATH. Video GIF conversion will be skipped.');
    console.warn('   (Install ffmpeg to enable animated GIF overlays in PPTX)');
  }

  // 2. Parse slides.md for metadata and notes
  console.log('📄 Parsing slides.md...');
  const mdContent = fs.readFileSync(SLIDES_MD, 'utf-8');
  const parsed = await parser.parse(mdContent);
  const slidesMeta = parsed.slides;
  const totalSlides = slidesMeta.length;
  console.log(`Found ${totalSlides} slides.`);

  // 3. Start local Slidev server
  console.log('\n🌐 Starting temporary Slidev server...');
  const options = await resolveOptions({ entry: 'slides.md' }, 'dev');
  const server = await createServer(options);
  const tempPort = 19880;
  const httpServer = await server.listen(tempPort);
  const port = httpServer.config?.server?.port || tempPort;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Slidev server ready at ${baseUrl}`);

  // 4. Launch Playwright
  console.log('\n📸 Launching browser to capture slides and compute exact video bounds...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2, // 2x high resolution
  });

  const slideOverlays = new Map(); // slideIndex (1-based) -> array of { gifPath, relX, relY, relW, relH }
  const gifCache = new Map(); // videoSrc -> gifPath

  try {
    for (let slideNo = 1; slideNo <= totalSlides; slideNo++) {
      process.stdout.write(`  Processing slide ${slideNo}/${totalSlides}... `);
      await page.goto(`${baseUrl}/${slideNo}`, { waitUntil: 'networkidle' });

      // Wait for main slide container
      const slideContainer = await page.waitForSelector('#slide-content');
      const slideBox = await slideContainer.boundingBox();

      if (!slideBox || slideBox.width === 0 || slideBox.height === 0) {
        console.warn(`[Warning: could not get bounds for slide ${slideNo}]`);
        continue;
      }

      // 4a. Capture slide screenshot
      const slidePngPath = path.join(SLIDES_DIR, `${slideNo}.png`);
      await slideContainer.screenshot({ path: slidePngPath });

      // 4b. Find any video elements on this slide
      const videoElements = await slideContainer.$$('video');
      if (videoElements.length > 0) {
        const overlays = [];
        for (const videoEl of videoElements) {
          const videoBox = await videoEl.boundingBox();
          const src = await videoEl.getAttribute('src');

          if (!videoBox || !src) continue;

          // Compute exact relative position and dimension within the slide
          const relX = (videoBox.x - slideBox.x) / slideBox.width;
          const relY = (videoBox.y - slideBox.y) / slideBox.height;
          const relW = videoBox.width / slideBox.width;
          const relH = videoBox.height / slideBox.height;

          let gifPath = gifCache.get(src);
          if (!gifPath && hasFfmpeg) {
            // Resolve file in public/
            const relPath = src.startsWith('/') ? src.slice(1) : src;
            const inputVideoPath = path.join(ROOT_DIR, 'public', relPath);

            if (fs.existsSync(inputVideoPath)) {
              const baseName = path.basename(inputVideoPath, path.extname(inputVideoPath));
              const outputGifPath = path.join(GIFS_DIR, `${baseName}.gif`);
              gifPath = await convertVideoToGif(inputVideoPath, outputGifPath);
              if (gifPath) gifCache.set(src, gifPath);
            } else {
              console.warn(`\n  ⚠️ Video source file not found: ${inputVideoPath}`);
            }
          }

          if (gifPath && fs.existsSync(gifPath)) {
            overlays.push({ gifPath, relX, relY, relW, relH });
          }
        }

        if (overlays.length > 0) {
          slideOverlays.set(slideNo, overlays);
          console.log(`✓ (${overlays.length} video overlay detected)`);
        } else {
          console.log('✓');
        }
      } else {
        console.log('✓');
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }

  // 5. Assemble PowerPoint Presentation
  console.log('\n📦 Assembling PPTX presentation...');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  for (let slideNo = 1; slideNo <= totalSlides; slideNo++) {
    const pngPath = path.join(SLIDES_DIR, `${slideNo}.png`);
    if (!fs.existsSync(pngPath)) continue;

    const pptSlide = pptx.addSlide();

    // Background slide image
    pptSlide.addImage({
      path: pngPath,
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
    });

    // Presenter note
    const note = slidesMeta[slideNo - 1]?.note;
    if (note && note.trim().length > 0) {
      pptSlide.addNotes(note.trim());
    }

    // Dynamic Video Overlays (exact bounds computed from DOM)
    const overlays = slideOverlays.get(slideNo);
    if (overlays && overlays.length > 0) {
      for (const ov of overlays) {
        const x = SLIDE_WIDTH_INCHES * ov.relX;
        const y = SLIDE_HEIGHT_INCHES * ov.relY;
        const w = SLIDE_WIDTH_INCHES * ov.relW;
        const h = SLIDE_HEIGHT_INCHES * ov.relH;

        pptSlide.addImage({
          path: ov.gifPath,
          x,
          y,
          w,
          h,
        });
      }
    }
  }

  await pptx.writeFile({ fileName: OUTPUT_PPTX });
  const totalMb = (fs.statSync(OUTPUT_PPTX).size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 Successfully exported PPTX: ${OUTPUT_PPTX} (${totalMb} MB)`);
  console.log('💡 Upload dist/slides.pptx to Google Slides or open in PowerPoint to present with animated videos!');
}

main().catch((err) => {
  console.error('\nFatal error during export:', err);
  process.exit(1);
});
