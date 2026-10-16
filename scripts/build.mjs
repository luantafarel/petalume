import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const pages = JSON.parse(await readFile('assets/catalog.json', 'utf8'));
const siteUrl = 'https://petalume.art.br/';
const analyticsToken = (process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN ?? '').trim();
if (analyticsToken && !/^[a-f0-9]{32}$/i.test(analyticsToken)) {
  throw new Error('CLOUDFLARE_WEB_ANALYTICS_TOKEN must be the 32-character public token from data-cf-beacon, not a Cloudflare API token.');
}
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

const analyticsScript = analyticsToken
  ? `  <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({ token: analyticsToken })}'></script>`
  : '';

const icon = (name) => `<img class="icon" src="assets/icons/${name}.svg" width="20" height="20" alt="" aria-hidden="true">`;

const hamburgerSvg = `<svg class="hamburger-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b3a36" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
  <line x1="3" y1="6" x2="21" y2="6"></line>
  <line x1="3" y1="12" x2="21" y2="12"></line>
  <line x1="3" y1="18" x2="21" y2="18"></line>
</svg>`;

// Títulos exatamente como no layout e nos botões
const mainSections = [
  { num: '01', title: 'SOBRE A PETALUME', slug: 'sobre-a-petalume', legacySlug: 'sobre', pages: [2] },
  { num: '02', title: 'O QUE FAZEMOS', slug: 'o-que-fazemos', legacySlug: null, pages: [3] },
  { num: '03', title: 'COMO FUNCIONA', slug: 'como-funciona', legacySlug: 'processo', pages: [4] },
  { num: '04', title: 'CATÁLOGO', slug: 'catalogo', legacySlug: 'pecas', pages: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22] },
  { num: '05', title: 'PRAZOS E PAGAMENTO', slug: 'prazos-e-pagamento', legacySlug: 'pagamento', pages: [23] },
  { num: '06', title: 'IMPORTANTE', slug: 'importante', legacySlug: 'cuidados', pages: [24, 25, 26, 27, 28, 29, 30, 31] },
  { num: '07', title: 'CONTATO', slug: 'contato', legacySlug: null, pages: [32] },
];

const headings = [
  'Petalume - Arte & Encanto', 'Sobre a Petalume', 'Memórias que podemos eternizar',
  'Processo de eternização', 'Catálogo - Modelos e variações', 'Memora', 'Áurea',
  'Flora', 'Prisma', 'Prisma XG e Amora', 'Floratta e Quadro Elora',
  'Kits Petália e Serena', 'Quadro Líria', 'Porta-joias', 'Signa, Lume e Elo Baby',
  'Ninho', 'Joias afetivas', 'Linha Lume - Folheado', 'Linha Enlace - Folheado',
  'Linha Alma - Folheado', 'Linha Enlace - Prata 925', 'Pulseiras e correntes',
  'Formas de pagamento', 'Informações importantes', 'Preservação das flores',
  'Transformações naturais das flores', 'Transformações naturais da resina',
  'Sobre buquês aramados', 'Sobre arranjos com lírios', 'Cuidados com sua peça',
  'Cada peça é única', 'Contato',
];

// Menu gaveta lateral com os títulos idênticos aos botões
const catalogMenu = `
  <nav class="catalog-drawer" id="catalog-drawer" popover="auto" aria-label="Menu do catálogo">
    <div class="drawer-header">
      <h2>Catálogo</h2>
      <button class="menu-close" type="button" popovertarget="catalog-drawer" popovertargetaction="hide" aria-label="Fechar menu" title="Fechar">${icon('x')}</button>
    </div>
    <ul class="drawer-nav">
${mainSections.map((sec) => `      <li><a href="${sec.slug}.html#pagina-${sec.pages[0]}" data-menu-link><span class="drawer-num">${sec.num}</span><span class="drawer-text">${sec.title}</span></a></li>`).join('\n')}
    </ul>
  </nav>`;

const contactLinks = `
      <div class="contact-content">
        <p class="eyebrow">Feito à mão, com afeto</p>
        <h2>Vamos eternizar<br>a sua história?</h2>
        <p>Cada memória merece um cuidado único. Conte para a Amanda o que você gostaria de guardar para sempre.</p>
        <div class="contact-actions">
          <a class="contact-link" href="https://wa.me/5531983693238?text=Olá%2C%20gostaria%20de%20saber%20mais%20sobre%20eternizar%20minha%20história" target="_blank" rel="noopener noreferrer">${icon('message-circle')}<span><small>WhatsApp</small>(31) 9 8369-3238</span>${icon('arrow-up-right')}</a>
          <a class="contact-link" href="mailto:petalumeatelier@gmail.com">${icon('mail')}<span><small>E-mail</small>petalumeatelier@gmail.com</span>${icon('arrow-up-right')}</a>
          <a class="contact-link" href="https://www.instagram.com/petalumeatelier/" target="_blank" rel="noopener noreferrer">${icon('camera')}<span><small>Instagram</small>@petalumeatelier</span>${icon('arrow-up-right')}</a>
        </div>
        <p class="contact-signature">Petalume · Arte &amp; Encanto</p>
      </div>`;

// Primeira página: Design com os atributos exatos da Amanda, adaptado para Celular e PC
const homePageContent = `
  <div class="amanda-page-wrapper">
    <header class="home-top-bar">
      <button class="clean-hamburger" type="button" popovertarget="catalog-drawer" aria-label="Abrir menu do catálogo" title="Abrir menu">${hamburgerSvg}</button>
      <a class="header-fale-conosco" href="contato.html#pagina-32">Fale conosco ${icon('arrow-right')}</a>
    </header>

    <div class="brand-section">
      <img class="brand-logo" src="assets/brand-logo.webp" width="730" height="770" alt="Petalume — Arte &amp; Encanto" fetchpriority="high">
      <p class="cursive-tagline">Suas memórias, em forma de arte.</p>
    </div>

    <!-- No PC: vira 2 colunas lado a lado; No celular: empilha verticalmente -->
    <div class="desktop-main-grid">
      <section class="before-after-section" aria-label="Antes e Depois">
        <div class="ba-col">
          <span class="ba-label">ANTES</span>
          <div class="ba-img-card">
            <img src="assets/antes-bouquet.webp" width="500" height="750" alt="Antes: Buquê de flores naturais" loading="eager" fetchpriority="high" decoding="async">
          </div>
        </div>
        <div class="ba-col">
          <span class="ba-label">DEPOIS</span>
          <div class="ba-img-card">
            <img src="assets/depois-tray.webp" width="500" height="750" alt="Depois: Bandeja de resina com flores eternizadas" loading="eager" fetchpriority="high" decoding="async">
          </div>
        </div>
      </section>

      <nav class="amanda-index-nav" aria-label="Índice do catálogo">
        <ul class="amanda-index-list">
${mainSections.slice(0, 6).map((sec) => `          <li><a href="${sec.slug}.html#pagina-${sec.pages[0]}"><span class="idx-num">${sec.num}</span><span class="idx-title">${sec.title}</span></a></li>`).join('\n')}
        </ul>
      </nav>
    </div>

    <footer class="amanda-footer-contact">
      <h3>Vamos eternizar a sua história?</h3>
      <ul class="footer-contact-list">
        <li>
          <a href="https://wa.me/5531983693238?text=Olá%2C%20gostaria%20de%20saber%20mais%20sobre%20eternizar%20minha%20história" target="_blank" rel="noopener noreferrer">
            <span class="contact-circle-icon">${icon('message-circle')}</span>
            <span>(31) 9 8369-3238</span>
          </a>
        </li>
        <li>
          <a href="mailto:petalumeatelier@gmail.com">
            <span class="contact-circle-icon">${icon('mail')}</span>
            <span>petalumeatelier@gmail.com</span>
          </a>
        </li>
        <li>
          <a href="https://www.instagram.com/petalumeatelier/" target="_blank" rel="noopener noreferrer">
            <span class="contact-circle-icon">${icon('camera')}</span>
            <span>@petalumeatelier</span>
          </a>
        </li>
      </ul>
    </footer>
  </div>`;

const renderCatalogPage = (page, firstPageNumber) => {
  const number = String(page.number).padStart(2, '0');
  const heading = escapeHtml(headings[page.number - 1]);
  const text = page.text.split('\n').map((line) => `          <p>${escapeHtml(line)}</p>`).join('\n');
  return `    <section class="catalog-page" id="pagina-${page.number}" aria-labelledby="titulo-${page.number}">
      <div class="accessible-text">
        <h2 id="titulo-${page.number}">${heading}</h2>
${text}
      </div>
      <img src="assets/pages/page-${number}-810.webp"
           srcset="assets/pages/page-${number}-810.webp 810w, assets/pages/page-${number}-1620.webp 1620w"
           sizes="(max-width: 810px) 100vw, 810px"
           width="810" height="1440" alt="" aria-hidden="true"
         loading="${page.number === firstPageNumber ? 'eager' : 'lazy'}"${page.number === firstPageNumber ? ' fetchpriority="high"' : ''} decoding="async">
${page.number === 32 ? contactLinks : ''}
    </section>`;
};

const renderDocument = ({ title, canonical, content, description, bodyClass = '' }) => `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#fbf7ec">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" href="assets/favicon.png">
  <link rel="preload" href="assets/fonts/livvic-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="styles.css">
  <script src="navigation.js" defer></script>
  <meta property="og:locale" content="pt_BR">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Petalume">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}assets/pages/page-01-810.webp">
</head>
<body class="${bodyClass}">
  <a class="skip-link" href="#conteudo-principal">Ir para o conteúdo</a>
  <div id="conteudo-principal">
${content}
  </div>
${catalogMenu}
${analyticsScript}
</body>
</html>
`;

// As seções existentes mantêm as páginas do catálogo intactas
const sectionPages = mainSections.map((sec, index) => {
  const firstPageNumber = sec.pages[0];
  const nextSection = index < mainSections.length - 1 ? mainSections[index + 1] : null;

  const chapterContent = `
    <header class="site-header">
      <button class="clean-hamburger" type="button" popovertarget="catalog-drawer" aria-label="Abrir menu do catálogo" title="Abrir menu">${hamburgerSvg}</button>
      <a class="header-contact" href="https://wa.me/5531983693238" target="_blank" rel="noopener noreferrer">Fale conosco ${icon('arrow-up-right')}</a>
    </header>
    <main class="chapter-document" aria-labelledby="chapter-title">
      <header class="chapter-heading">
        <a class="home-return" href="index.html">${icon('arrow-left')} Início</a>
        <p class="eyebrow">Catálogo Petalume · ${sec.num}</p>
        <h1 id="chapter-title">${sec.title}</h1>
      </header>
${sec.pages.map((number) => renderCatalogPage(pages[number - 1], firstPageNumber)).join('\n')}
      <footer class="chapter-footer">
        <a href="index.html">Voltar ao Início</a>
        ${nextSection ? `<a href="${nextSection.slug}.html#pagina-${nextSection.pages[0]}">Próxima seção: ${nextSection.title} ${icon('arrow-right')}</a>` : ''}
      </footer>
    </main>`;

  const doc = renderDocument({
    title: `${sec.title} | Petalume`,
    canonical: `${siteUrl}${sec.slug}.html`,
    description: `${sec.title} — Catálogo artesanal Petalume.`,
    content: chapterContent,
    bodyClass: 'section-page',
  });

  return {
    slug: sec.slug,
    legacySlug: sec.legacySlug,
    filename: `${sec.slug}.html`,
    html: doc,
  };
});

const home = renderDocument({
  title: 'Petalume | Arte &amp; Encanto',
  canonical: siteUrl,
  description: 'Suas memórias, em forma de arte. Flores e lembranças eternizadas em peças artesanais e joias afetivas.',
  content: homePageContent,
  bodyClass: 'home-page',
});

await rm('_site', { recursive: true, force: true });
await mkdir('_site/assets/pages', { recursive: true });
await mkdir('_site/assets/fonts', { recursive: true });
await writeFile('_site/index.html', home);

// Salva páginas com os nomes dos botões e também com os nomes legados para compatibilidade
for (const section of sectionPages) {
  await writeFile(`_site/${section.filename}`, section.html);
  if (section.legacySlug && section.legacySlug !== section.slug) {
    await writeFile(`_site/${section.legacySlug}.html`, section.html);
  }
}

await cp('styles.css', '_site/styles.css');
await cp('navigation.js', '_site/navigation.js');
await cp('assets/favicon.png', '_site/assets/favicon.png');
await cp('assets/paper.webp', '_site/assets/paper.webp');
await cp('assets/brand-logo.webp', '_site/assets/brand-logo.webp');
await cp('assets/antes-bouquet.webp', '_site/assets/antes-bouquet.webp');
await cp('assets/depois-tray.webp', '_site/assets/depois-tray.webp');
await cp('assets/fonts/Respondent-Medium.ttf', '_site/assets/fonts/Respondent-Medium.ttf');
await cp('assets/fonts/Garet-Bold.ttf', '_site/assets/fonts/Garet-Bold.ttf');

for (const [family, weights] of [['livvic', [400, 500, 600, 700]], ['montserrat', [600, 700, 800]]]) {
  for (const weight of weights) {
    const filename = `${family}-latin-${weight}-normal.woff2`;
    await cp(`node_modules/@fontsource/${family}/files/${filename}`, `_site/assets/fonts/${filename}`);
  }
  await cp(`node_modules/@fontsource/${family}/LICENSE`, `_site/assets/fonts/${family}-LICENSE.txt`);
}

await mkdir('_site/assets/icons', { recursive: true });
for (const name of ['arrow-right', 'arrow-up-right', 'arrow-left', 'message-circle', 'mail', 'camera', 'x', 'menu']) {
  await cp(`node_modules/lucide-static/icons/${name}.svg`, `_site/assets/icons/${name}.svg`);
}

for (const page of pages) {
  const number = String(page.number).padStart(2, '0');
  for (const width of [810, 1620]) {
    const filename = `page-${number}-${width}.webp`;
    await cp(`assets/pages/${filename}`, `_site/assets/pages/${filename}`);
  }
}

await writeFile('_site/.nojekyll', '');
await writeFile('_site/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`);
const sitemapEntries = [siteUrl, ...sectionPages.map((section) => `${siteUrl}${section.filename}`)]
  .map((url) => `<url><loc>${url}</loc></url>`).join('');
await writeFile('_site/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}</urlset>\n`);
console.log(`Built Petalume responsive site: 1 home page and ${sectionPages.length} sections in _site/`);
