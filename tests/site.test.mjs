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
  const catalogSections = html.match(/<section class="catalog-page"[\s\S]*?<\/section>/g) ?? [];
  assert.equal(catalogSections.filter((section) => section.includes('loading="lazy"')).length, 32);
  assert.ok(html.includes('lang="pt-BR"'));
  assert.ok(html.includes('fetchpriority="high"'));
  assert.ok(html.includes('https://wa.me/5531983693238'));
  assert.ok(html.includes('mailto:petalumeatelier@gmail.com'));
  assert.ok(html.includes('https://www.instagram.com/petalumeatelier/'));
  assert.ok(html.includes('<script src="navigation.js" defer></script>'));
  assert.equal((await readdir('_site/assets/pages')).length, 64);
  assert.ok((await stat('_site/styles.css')).size > 0);
  assert.ok((await stat('_site/assets/favicon.png')).size > 0);
  assert.ok(!(await readdir('_site')).some((filename) => filename.endsWith('.pdf')));
});

test('the landing and section map expose working destinations without JavaScript', async () => {
  const html = await readFile('_site/index.html', 'utf8');
  assert.ok(html.includes('class="landing" id="inicio"'));
  assert.ok(html.includes('class="brand-logo"'));
  assert.ok(html.includes('aria-label="Mapa do catálogo"'));
  const destinations = ['inicio', 'pagina-2', 'pagina-4', 'pagina-5', 'pagina-17', 'pagina-23', 'pagina-24', 'pagina-32'];
  for (const destination of destinations) {
    assert.ok(html.includes(`id="${destination}"`));
    assert.ok(html.includes(`href="#${destination}" data-section-link`));
  }
  assert.ok(html.includes('data-section-previous'));
  assert.ok(html.includes('data-section-next'));
  assert.ok(html.includes('aria-current="location"'));
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((html.match(/class="page-reading"/g) ?? []).length, 30);
  assert.ok((await stat('_site/navigation.js')).size > 0);
  assert.ok((await stat('_site/assets/brand-logo.webp')).size > 0);
  assert.ok((await sharp('_site/assets/brand-logo.webp').metadata()).hasAlpha);
});

test('every catalog page belongs to an accessible subtopic destination', async () => {
  const html = await readFile('_site/index.html', 'utf8');
  const subtopics = [...html.matchAll(/href="#([^"]+)" data-subtopic-link data-chapter="(\d+)"/g)];
  assert.equal(subtopics.length, 32);
  assert.equal(new Set(subtopics.map((match) => match[1])).size, 32);
  for (const [match, destination] of subtopics) {
    assert.ok(html.includes(`id="${destination}"`), match);
  }
  assert.deepEqual(Array.from({ length: 8 }, (_, chapter) => subtopics.filter((match) => Number(match[2]) === chapter).length), [1, 2, 1, 12, 6, 1, 8, 1]);
  assert.ok(html.includes('popovertarget="subtopic-menu"'));
  assert.ok(html.includes('id="subtopic-menu" popover="auto"'));
  assert.ok(html.includes('data-subtopic-count'));
});