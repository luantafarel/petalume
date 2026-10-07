import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const pages = JSON.parse(await readFile('assets/catalog.json', 'utf8'));
const siteUrl = 'https://petalume.art.br/';
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

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

const icon = (name) => `<img class="icon" src="assets/icons/${name}.svg" width="20" height="20" alt="" aria-hidden="true">`;
const chapters = [
  { id: 'inicio', slug: 'index', label: 'Início', pages: [1] },
  { id: 'pagina-2', slug: 'sobre', label: 'Sobre', pages: [2, 3] },
  { id: 'pagina-4', slug: 'processo', label: 'Processo', pages: [4] },
  { id: 'pagina-5', slug: 'pecas', label: 'Peças', pages: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
  { id: 'pagina-17', slug: 'joias', label: 'Joias', pages: [17, 18, 19, 20, 21, 22] },
  { id: 'pagina-23', slug: 'pagamento', label: 'Pagamento', pages: [23] },
  { id: 'pagina-24', slug: 'cuidados', label: 'Cuidados', pages: [24, 25, 26, 27, 28, 29, 30, 31] },
  { id: 'pagina-32', slug: 'contato', label: 'Contato', pages: [32] },
];

const subtopicLabel = (number) => number === 1 ? 'Apresentação' : number === 5 ? 'Modelos e variações' : headings[number - 1];
const catalogMenu = (currentSlug) => `
  <nav class="catalog-drawer" id="catalog-drawer" popover="auto" aria-label="Menu do catálogo">
    <div class="drawer-header"><h2>Explorar catálogo</h2><button class="menu-close" type="button" popovertarget="catalog-drawer" popovertargetaction="hide" aria-label="Fechar menu" title="Fechar">${icon('x')}</button></div>
    <p class="drawer-intro">Petalume · Arte &amp; Encanto</p>
    <div class="drawer-sections">
${chapters.map((chapter, index) => `      <section class="drawer-section" aria-labelledby="grupo-${index}">
        <h3 id="grupo-${index}">${chapter.label}</h3>
        <ul>
${chapter.pages.map((number, position) => {
  const local = chapter.slug === currentSlug;
  const destination = chapter.slug === 'index' ? 'index.html#inicio' : `${chapter.slug}.html#pagina-${number}`;
  return `          <li><a href="${local ? `#pagina-${number}` : destination}" data-menu-link${local ? ` data-page="${number}"` : ''}${local && position === 0 ? ' aria-current="location"' : ''}><span class="drawer-number">${String(position + 1).padStart(2, '0')}</span><span>${escapeHtml(subtopicLabel(number))}</span></a></li>`;
}).join('\n')}
        </ul>
      </section>`).join('\n')}
    </div>
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

const siteHeader = `
  <header class="site-header">
    <button class="menu-trigger" type="button" popovertarget="catalog-drawer" aria-label="Abrir menu do catálogo" title="Abrir menu">${icon('menu')}</button>
    <a class="header-contact" href="https://wa.me/5531983693238" target="_blank" rel="noopener noreferrer">Fale conosco ${icon('arrow-up-right')}</a>
  </header>`;

const landing = `
    <section class="landing" id="inicio" aria-labelledby="brand-title">
${siteHeader}
      <div class="landing-content">
        <h1 id="brand-title"><img class="brand-logo" src="assets/brand-logo.webp" width="730" height="770" alt="Petalume — Arte &amp; Encanto" fetchpriority="high" loading="eager"></h1>
        <p class="landing-description">Suas memórias, em forma de arte.</p>
        <p class="landing-support">Flores e lembranças transformadas à mão em peças únicas para guardar por perto.</p>
        <div class="landing-actions">
          <a class="primary-action" href="#secoes">Explorar catálogo ${icon('arrow-right')}</a>
          <a class="story-action" href="sobre.html#pagina-2">Nossa história</a>
        </div>
        <p class="edition">Coleção Setembro / 2026</p>
      </div>
      <div class="memory-strip" aria-label="Peças Memora em resina">
        <a href="pecas.html#pagina-6"><img src="assets/memora-blue.webp" width="796" height="780" alt="Memora P: flor azul eternizada em uma esfera de resina" loading="lazy"><span>Uma flor.</span></a>
        <a href="pecas.html#pagina-6"><img src="assets/memora-pink.webp" width="808" height="788" alt="Memora M: flores cor-de-rosa preservadas em resina" loading="lazy"><span>Uma história.</span></a>
        <a href="pecas.html#pagina-6"><img src="assets/memora-bouquet.webp" width="798" height="780" alt="Memora G: composição de flores coloridas em resina transparente" loading="lazy"><span>Para sempre.</span></a>
      </div>
      <div class="collection-note"><span>Arte que guarda o que importa.</span></div>
    </section>`;

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
           loading="${page.number === firstPageNumber ? 'eager' : 'lazy'}" decoding="async">
${page.number === 32 ? contactLinks : ''}
    </section>`;
};

const chapterDirectory = `
    <section class="section-directory" id="secoes" aria-labelledby="sections-title">
      <p class="eyebrow">O catálogo Petalume</p>
      <div class="directory-heading">
        <h2 id="sections-title">Cada lembrança encontra uma forma de ficar.</h2>
        <p>Conheça o ateliê, explore as criações e descubra os detalhes de cada etapa.</p>
      </div>
      <div class="chapter-overview">
${[
  { label: 'A história por trás', slugs: ['sobre', 'processo'] },
  { label: 'Criações para guardar', slugs: ['pecas', 'joias'] },
  { label: 'Sua experiência Petalume', slugs: ['pagamento', 'cuidados'] },
].map((group) => `        <section class="chapter-group">
          <h3>${group.label}</h3>
          <ul>
${group.slugs.map((slug) => {
  const chapter = chapters.find((item) => item.slug === slug);
  const index = chapters.indexOf(chapter);
  return `            <li><a href="${chapter.slug}.html#pagina-${chapter.pages[0]}"><span class="chapter-group-number">${String(index).padStart(2, '0')}</span><span class="chapter-group-link"><span>${chapter.label}</span><small>${String(chapter.pages.length).padStart(2, '0')} ${chapter.pages.length === 1 ? 'página' : 'páginas'}</small></span>${icon('arrow-up-right')}</a></li>`;
}).join('\n')}
          </ul>
        </section>`).join('\n')}
      </div>
      <div class="chapter-contact">
        <div><p>Uma lembrança especial?</p><h3>Vamos conversar.</h3></div>
        <a href="contato.html#pagina-32">Fale conosco ${icon('arrow-right')}</a>
      </div>
      <div class="chapter-cards">
${chapters.slice(1).map((chapter, index) => `        <a class="chapter-card" href="${chapter.slug}.html#pagina-${chapter.pages[0]}">
          <span class="chapter-card-number">${String(index + 1).padStart(2, '0')}</span>
          <span class="chapter-card-title">${chapter.label}</span>
          <span class="chapter-card-count">${String(chapter.pages.length).padStart(2, '0')} ${chapter.pages.length === 1 ? 'página' : 'páginas'}</span>
          ${icon('arrow-up-right')}
        </a>`).join('\n')}
      </div>
    </section>`;

const renderDocument = ({ title, canonical, content, currentSlug, description }) => `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f7f3e8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" href="assets/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
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
<body>
  <a class="skip-link" href="#conteudo-principal">Ir para o conteúdo</a>
${content}
${catalogMenu(currentSlug)}
</body>
</html>
`;

const home = renderDocument({
  title: 'Petalume | Arte &amp; Encanto',
  canonical: siteUrl,
  description: 'Suas memórias, em forma de arte. Flores e lembranças transformadas à mão em peças únicas para guardar por perto.',
  currentSlug: null,
  content: `${landing}<main id="conteudo-principal" aria-label="Catálogo Petalume">${chapterDirectory}</main>`,
});

const sectionPages = chapters.slice(1).map((chapter, index) => {
  const firstPageNumber = chapter.pages[0];
  const chapterContent = `
${siteHeader}
    <main class="chapter-document" id="conteudo-principal" aria-labelledby="chapter-title">
      <header class="chapter-heading">
        <a class="home-return" href="index.html#secoes">${icon('arrow-left')} Índice do catálogo</a>
        <p class="eyebrow">Catálogo Petalume · ${String(index + 1).padStart(2, '0')}</p>
        <h1 id="chapter-title">${chapter.label}</h1>
      </header>
${chapter.pages.map((number) => renderCatalogPage(pages[number - 1], firstPageNumber)).join('\n')}
      <footer class="chapter-footer">
        <a href="index.html#secoes">Voltar às seções</a>
        ${index < chapters.length - 2 ? `<a href="${chapters[index + 2].slug}.html#pagina-${chapters[index + 2].pages[0]}">Próxima seção: ${chapters[index + 2].label} ${icon('arrow-right')}</a>` : ''}
      </footer>
    </main>`;
  return {
    filename: `${chapter.slug}.html`,
    html: renderDocument({
      title: `${chapter.label} | Petalume`,
      canonical: `${siteUrl}${chapter.slug}.html`,
      description: `${chapter.label}: catálogo artesanal Petalume, flores e memórias eternizadas.`,
      currentSlug: chapter.slug,
      content: chapterContent,
    }),
  };
});

await rm('_site', { recursive: true, force: true });
await mkdir('_site/assets/pages', { recursive: true });
await writeFile('_site/index.html', home);
for (const section of sectionPages) await writeFile(`_site/${section.filename}`, section.html);
await cp('styles.css', '_site/styles.css');
await cp('navigation.js', '_site/navigation.js');
await cp('assets/favicon.png', '_site/assets/favicon.png');
await mkdir('_site/assets/icons', { recursive: true });
for (const name of ['arrow-right', 'arrow-up-right', 'arrow-down', 'arrow-left', 'message-circle', 'mail', 'camera', 'x', 'menu']) {
  await cp(`node_modules/lucide-static/icons/${name}.svg`, `_site/assets/icons/${name}.svg`);
}
const logo = await sharp('assets/pages/page-01-1620.webp')
  .extract({ left: 774, top: 946, width: 730, height: 770 })
  .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let offset = 0; offset < logo.data.length; offset += 4) {
  const red = logo.data[offset];
  const green = logo.data[offset + 1];
  const blue = logo.data[offset + 2];
  const darkness = Math.max(red, green, blue);
  const inkAlpha = darkness < 170 ? Math.min(1, (200 - darkness) / 130) : 0;
  const goldAlpha = green - blue > 25 ? Math.min(1, Math.max(0, (red - blue - 42) / 35)) : 0;
  logo.data[offset + 3] = Math.round(Math.max(inkAlpha, goldAlpha) * 255);
  if (inkAlpha > goldAlpha) {
    logo.data[offset] = 41;
    logo.data[offset + 1] = 39;
    logo.data[offset + 2] = 36;
  }
}
const logoImage = sharp(logo.data, { raw: logo.info });
await logoImage.clone().webp({ quality: 95 }).toFile('_site/assets/brand-logo.webp');
await logoImage.extract({ left: 200, top: 60, width: 330, height: 280 })
  .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png().toFile('_site/assets/favicon.png');
await sharp('assets/pages/page-01-1620.webp')
  .extract({ left: 1050, top: 100, width: 400, height: 400 })
  .resize(256).linear(0.4, 153).webp({ quality: 80 }).toFile('_site/assets/paper.webp');
for (const [name, region] of [
  ['memora-blue', { left: 106, top: 124, width: 796, height: 780 }],
  ['memora-pink', { left: 706, top: 1052, width: 808, height: 788 }],
  ['memora-bouquet', { left: 64, top: 1988, width: 798, height: 780 }],
]) {
  await sharp('assets/pages/page-06-1620.webp').extract(region)
    .webp({ quality: 88 }).toFile(`_site/assets/${name}.webp`);
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
console.log(`Built Petalume: 1 landing page and ${sectionPages.length} catalog sections in _site/`);