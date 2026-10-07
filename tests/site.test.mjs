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
  assert.equal((html.match(/class="catalog-page"/g) ?? []).length, 0);
  assert.equal((html.match(/class="chapter-card"/g) ?? []).length, 7);
  assert.equal((await readdir('_site')).filter((filename) => filename.endsWith('.html')).length, 8);
  assert.ok(html.includes('lang="pt-BR"'));
  assert.ok(html.includes('<script src="navigation.js" defer></script>'));
  assert.equal((await readdir('_site/assets/pages')).length, 64);
  assert.ok((await stat('_site/styles.css')).size > 0);
  assert.ok((await stat('_site/assets/favicon.png')).size > 0);
  assert.ok((await sharp('_site/assets/favicon.png').metadata()).hasAlpha);
    const favicon = await sharp('_site/assets/favicon.png').ensureAlpha().raw().toBuffer();
    assert.equal(favicon[3], 0);
  assert.ok(!(await readdir('_site')).some((filename) => filename.endsWith('.pdf')));
    assert.equal((html.match(/class="chapter-group"/g) ?? []).length, 3);
    assert.equal((html.match(/class="chapter-card"/g) ?? []).length, 7);
    assert.ok(html.includes('A história por trás'));
    assert.ok(html.includes('Criações para guardar'));
    assert.ok(html.includes('Sua experiência Petalume'));
    assert.ok(html.includes('class="chapter-contact"'));
    assert.ok(html.includes('href="contato.html#pagina-32">Fale conosco'));
});

test('the landing links to every dedicated catalog section', async () => {
  const html = await readFile('_site/index.html', 'utf8');
  assert.ok(html.includes('class="landing" id="inicio"'));
  assert.ok(html.includes('class="brand-logo"'));
  assert.ok(html.includes('Suas memórias, em forma de arte.'));
  assert.ok(html.includes('Flores e lembranças transformadas à mão'));
  assert.ok(html.includes('id="secoes"'));
  assert.ok(html.includes('Cada lembrança encontra uma forma de ficar.'));
  for (const slug of ['sobre', 'processo', 'pecas', 'joias', 'pagamento', 'cuidados', 'contato']) {
    assert.ok(html.includes(`href="${slug}.html#pagina-`));
    const section = await readFile(`_site/${slug}.html`, 'utf8');
    assert.ok(section.includes('class="chapter-document"'));
    assert.ok(section.includes('aria-label="Menu do catálogo"'));
  }
  assert.ok(html.includes('aria-label="Abrir menu do catálogo"'));
  assert.ok(html.includes('id="catalog-drawer" popover="auto"'));
  assert.ok(!html.includes('class="section-map"'));
    const styles = await readFile('_site/styles.css', 'utf8');
    assert.ok(!styles.includes('.section-map'));
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.ok((await stat('_site/assets/brand-logo.webp')).size > 0);
  assert.ok((await sharp('_site/assets/brand-logo.webp').metadata()).hasAlpha);
});

test('the drawer links to all 32 page destinations and section pages contain the expected artwork', async () => {
  const html = await readFile('_site/index.html', 'utf8');
  const destinations = [...html.matchAll(/href="([^"]+)" data-menu-link/g)].map((match) => match[1]);
  assert.equal(destinations.length, 32);
  assert.equal(new Set(destinations).size, 32);
  for (const [slug, count] of [['sobre', 2], ['processo', 1], ['pecas', 12], ['joias', 6], ['pagamento', 1], ['cuidados', 8], ['contato', 1]]) {
    const section = await readFile(`_site/${slug}.html`, 'utf8');
    assert.equal((section.match(/class="catalog-page"/g) ?? []).length, count);
    assert.equal((section.match(/class="accessible-text"/g) ?? []).length, count);
    assert.ok(section.includes('class="chapter-heading"'));
  }
  assert.ok(html.includes('data-menu-link'));
  assert.ok((await stat('_site/navigation.js')).size > 0);
});

test('canonical and sharing metadata, robots, and sitemap use the custom domain', async () => {
  const siteUrl = 'https://petalume.art.br/';
  const html = await readFile('_site/index.html', 'utf8');
  assert.ok(html.includes(`<link rel="canonical" href="${siteUrl}">`));
  assert.ok(html.includes(`<meta property="og:url" content="${siteUrl}">`));
  assert.ok(html.includes(`<meta property="og:image" content="${siteUrl}assets/pages/page-01-810.webp">`));
  assert.ok(!html.includes('https://luantafarel.github.io/petalume/'));
  assert.ok((await readFile('_site/robots.txt', 'utf8')).includes(`Sitemap: ${siteUrl}sitemap.xml`));
  const sitemap = await readFile('_site/sitemap.xml', 'utf8');
  assert.ok(sitemap.includes(`<loc>${siteUrl}</loc>`));
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, 8);
  for (const slug of ['sobre', 'processo', 'pecas', 'joias', 'pagamento', 'cuidados', 'contato']) {
    assert.ok(sitemap.includes(`<loc>${siteUrl}${slug}.html</loc>`));
  }
});