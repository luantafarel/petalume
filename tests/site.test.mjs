import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
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

test('the landing page renders the exact layout with before-after, index, and contact', async () => {
  const html = await readFile('_site/index.html', 'utf8');
  assert.ok(html.includes('class="amanda-page-wrapper"'));
  assert.ok(html.includes('class="clean-hamburger"'));
  assert.ok(html.includes('class="brand-logo"'));
  assert.ok(html.includes('Suas memórias, em forma de arte.'));
  assert.ok(html.includes('ANTES'));
  assert.ok(html.includes('DEPOIS'));
  assert.ok(html.includes('assets/antes-bouquet.webp'));
  assert.ok(html.includes('assets/depois-tray.webp'));
  assert.ok(html.includes('SOBRE A PETALUME'));
  assert.ok(html.includes('O QUE FAZEMOS'));
  assert.ok(html.includes('COMO FUNCIONA'));
  assert.ok(html.includes('CATÁLOGO'));
  assert.ok(html.includes('PRAZOS E PAGAMENTO'));
  assert.ok(html.includes('IMPORTANTE'));
  assert.ok(html.includes('Vamos eternizar a sua história?'));
  assert.ok(html.includes('https://wa.me/5531983693238'));
  assert.ok(html.includes('mailto:petalumeatelier@gmail.com'));
  assert.ok(html.includes('https://www.instagram.com/petalumeatelier/'));
  assert.ok(html.includes('id="catalog-drawer" popover="auto"'));
  assert.ok((await readdir('_site')).filter((filename) => filename.endsWith('.html')).length >= 8);
  assert.ok((await stat('_site/assets/favicon.png')).size > 0);
  assert.ok((await sharp('_site/assets/favicon.png').metadata()).hasAlpha);
});

test('section pages render catalog pages and navigation', async () => {
  const expectedSections = [
    { slug: 'sobre-a-petalume', title: 'SOBRE A PETALUME', count: 1 },
    { slug: 'o-que-fazemos', title: 'O QUE FAZEMOS', count: 1 },
    { slug: 'como-funciona', title: 'COMO FUNCIONA', count: 1 },
    { slug: 'catalogo', title: 'CATÁLOGO', count: 18 },
    { slug: 'prazos-e-pagamento', title: 'PRAZOS E PAGAMENTO', count: 1 },
    { slug: 'importante', title: 'IMPORTANTE', count: 8 },
    { slug: 'contato', title: 'CONTATO', count: 1 },
  ];

  for (const sec of expectedSections) {
    const section = await readFile(`_site/${sec.slug}.html`, 'utf8');
    assert.equal((section.match(/class="catalog-page"/g) ?? []).length, sec.count);
    assert.ok(section.includes(`<title>${sec.title} | Petalume</title>`));
    assert.ok(section.includes(`<h1 id="chapter-title">${sec.title}</h1>`));
  }
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
});

test('Cloudflare Analytics is optional and consistent across every generated page', async () => {
  const filenames = (await readdir('_site')).filter((filename) => filename.endsWith('.html'));
  const home = await readFile('_site/index.html', 'utf8');
  const source = 'https://static.cloudflareinsights.com/beacon.min.js';
  const enabled = home.includes(source);
  const configuredToken = process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim();
  if (configuredToken !== undefined) assert.equal(enabled, Boolean(configuredToken));
  let expectedToken = configuredToken;
  for (const filename of filenames) {
    const html = await readFile(`_site/${filename}`, 'utf8');
    const scripts = [...html.matchAll(/<script\b[^>]*src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js"[^>]*><\/script>/g)];
    assert.equal(scripts.length, enabled ? 1 : 0, filename);
    assert.ok(!html.includes('CLOUDFLARE_WEB_ANALYTICS_TOKEN'), filename);
    if (enabled) {
      const script = scripts[0][0];
      assert.ok(script.includes(' defer '), filename);
      const attribute = script.match(/data-cf-beacon='([^']+)'/);
      assert.ok(attribute, filename);
      const configuration = JSON.parse(attribute[1]);
      assert.match(configuration.token, /^[a-f0-9]{32}$/i, filename);
      expectedToken ??= configuration.token;
      assert.equal(configuration.token, expectedToken, filename);
      assert.ok(html.indexOf(script) < html.indexOf('</body>'), filename);
    } else {
      assert.ok(!html.includes('data-cf-beacon'), filename);
    }
  }
});

test('Cloudflare Analytics rejects invalid identifiers before publishing', () => {
  const result = spawnSync(process.execPath, ['scripts/build.mjs'], {
    encoding: 'utf8',
    timeout: 10000,
    env: { ...process.env, CLOUDFLARE_WEB_ANALYTICS_TOKEN: 'not-a-public-site-token' },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must be the 32-character public token/);
});
