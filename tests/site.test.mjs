import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import test from 'node:test';
import sharp from 'sharp';

test('all 32 catalog pages have responsive assets with the original proportions', async () => {
  const pages = JSON.parse(await readFile('assets/catalog.json', 'utf8'));
  assert.equal(pages.length, 32);
  for (const [index, page] of pages.entries()) {
    assert.equal(page.number, index + 1);
    assert.ok(page.text.trim().length > 10);
    for (const width of [810, 1620]) {
      const filename = `_site/assets/pages/page-${String(page.number).padStart(2, '0')}-${width}.webp`;
      const metadata = await sharp(filename).metadata();
      assert.equal(metadata.width, width);
      assert.equal(metadata.height, width * 16 / 9);
      assert.equal(metadata.format, 'webp');
    }
  }
});

test('the published artifact is static, complete, and excludes the original PDF', async () => {
  const html = await readFile('_site/index.html', 'utf8');
  assert.equal((html.match(/class="catalog-page"/g) ?? []).length, 32);
  assert.equal((html.match(/class="accessible-text"/g) ?? []).length, 32);
  assert.equal((html.match(/loading="lazy"/g) ?? []).length, 31);
  assert.ok(html.includes('lang="pt-BR"'));
  assert.ok(html.includes('fetchpriority="high"'));
  assert.ok(html.includes('https://wa.me/5531983693238'));
  assert.ok(html.includes('mailto:petalumeatelier@gmail.com'));
  assert.ok(html.includes('https://www.instagram.com/petalumeatelier/'));
  assert.ok(!html.includes('<script'));
  assert.equal((await readdir('_site/assets/pages')).length, 64);
  assert.ok((await stat('_site/styles.css')).size > 0);
  assert.ok((await stat('_site/assets/favicon.png')).size > 0);
  assert.ok(!(await readdir('_site')).some((filename) => filename.endsWith('.pdf')));
});