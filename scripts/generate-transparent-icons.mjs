import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const SOURCE_SVG = path.join(root, 'tmp', 'logo-propositions', '3-monogramme-dmi.svg');
const OUTPUTS = [
  { path: path.join(root, 'public', 'icon-192x192.png'), size: 192 },
  { path: path.join(root, 'public', 'icon-512x512.png'), size: 512 },
  { path: path.join(root, 'public', 'apple-touch-icon.png'), size: 180 },
];

async function ensureSourceExists(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`Source SVG not found: ${filePath}`);
  }
}

async function generateTransparentPng(page, svgDataUri, outputPath, size) {
  await page.setViewportSize({ width: size, height: size });

  const html = `<html><body style="margin:0"><img id="logo" src="${svgDataUri}" style="display:block;width:100vw;height:100vh;object-fit:contain"/></body></html>`;

  await page.setContent(html);
  await page.waitForSelector('#logo');
  await page.waitForFunction(() => {
    const image = document.getElementById('logo');
    return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
  });

  await page.screenshot({
    path: outputPath,
    omitBackground: true,
  });
}

async function verifyCornersAreTransparent(page, outputPath) {
  const pngBytes = await fs.readFile(outputPath);
  const pngDataUrl = `data:image/png;base64,${pngBytes.toString('base64')}`;

  await page.setContent('<canvas id="canvas"></canvas>');

  const alphaCorners = await page.evaluate(async (src) => {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });

    const canvas = document.getElementById('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(img, 0, 0);

    const topLeft = context.getImageData(0, 0, 1, 1).data[3];
    const topRight = context.getImageData(canvas.width - 1, 0, 1, 1).data[3];
    const bottomLeft = context.getImageData(0, canvas.height - 1, 1, 1).data[3];
    const bottomRight = context.getImageData(canvas.width - 1, canvas.height - 1, 1, 1).data[3];

    return { topLeft, topRight, bottomLeft, bottomRight };
  }, pngDataUrl);

  const allTransparent = Object.values(alphaCorners).every((alpha) => alpha === 0);
  if (!allTransparent) {
    throw new Error(`Transparency check failed for ${outputPath}: ${JSON.stringify(alphaCorners)}`);
  }

  return alphaCorners;
}

async function main() {
  await ensureSourceExists(SOURCE_SVG);

  const svgText = await fs.readFile(SOURCE_SVG, 'utf8');
  const svgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    for (const output of OUTPUTS) {
      await generateTransparentPng(page, svgDataUri, output.path, output.size);
      const alphaCorners = await verifyCornersAreTransparent(page, output.path);
      console.log(`Generated ${path.relative(root, output.path)} (${output.size}x${output.size}) alpha=${JSON.stringify(alphaCorners)}`);
    }
  } finally {
    await browser.close();
  }

  console.log('Transparent icons generated successfully.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
