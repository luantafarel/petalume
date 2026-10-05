import { readFile, stat } from 'node:fs/promises';
import sharp from 'sharp';

const pages = JSON.parse(await readFile('assets/catalog.json', 'utf8'));
let totalBytes = 0;

for (const page of pages) {
  const number = String(page.number).padStart(2, '0');
  for (const width of [810, 1620]) {
    const basename = `assets/pages/page-${number}-${width}`;
    await sharp(`${basename}.jpg`)
      .webp({ quality: 85, effort: 6 })
      .toFile(`${basename}.webp`);
    totalBytes += (await stat(`${basename}.webp`)).size;
  }
  console.log(`Optimized page ${page.number}/${pages.length}`);
}

await sharp('assets/pages/page-01-1620.jpg')
  .extract({ left: 930, top: 940, width: 400, height: 580 })
  .resize(64, 64, { fit: 'contain', background: '#f7f3e8' })
  .png()
  .toFile('assets/favicon.png');

console.log(`WebP assets: ${(totalBytes / 1024 / 1024).toFixed(1)} MB total.`);