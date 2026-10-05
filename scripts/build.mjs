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
  { id: 'inicio', label: 'Início', pages: [1] },
  { id: 'pagina-2', label: 'Sobre', pages: [2, 3] },
  { id: 'pagina-4', label: 'Processo', pages: [4] },
  { id: 'pagina-5', label: 'Peças', pages: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
  { id: 'pagina-17', label: 'Joias', pages: [17, 18, 19, 20, 21, 22] },
  { id: 'pagina-23', label: 'Pagamento', pages: [23] },
  { id: 'pagina-24', label: 'Cuidados', pages: [24, 25, 26, 27, 28, 29, 30, 31] },
  { id: 'pagina-32', label: 'Contato', pages: [32] },
];

const subtopicLabel = (number) => number === 1 ? 'Apresentação' : number === 5 ? 'Modelos e variações' : headings[number - 1];
const subtopicMenu = `
  <div class="subtopic-menu" id="subtopic-menu" popover="auto" aria-labelledby="subtopic-title">
    <div class="subtopic-header"><h2 id="subtopic-title">Explorar catálogo</h2><button class="menu-close" type="button" popovertarget="subtopic-menu" popovertargetaction="hide" aria-label="Fechar subtópicos" title="Fechar">${icon('x')}</button></div>
${chapters.map((chapter, index) => `    <section class="subtopic-group" data-subtopic-group="${index}" aria-labelledby="grupo-${index}">
      <h3 id="grupo-${index}">${chapter.label}</h3>
      <div class="subtopic-options">
${chapter.pages.map((number, position) => `        <a href="#${number === 1 ? 'inicio' : `pagina-${number}`}" data-subtopic-link data-chapter="${index}" data-label="${escapeHtml(subtopicLabel(number))}"><span class="subtopic-number">${String(position + 1).padStart(2, '0')}</span><span>${escapeHtml(subtopicLabel(number))}</span>${icon('arrow-up-right')}</a>`).join('\n')}
      </div>
    </section>`).join('\n')}
  </div>`;

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

const landing = `
    <section class="landing" id="inicio" aria-labelledby="brand-title">
      <header class="landing-header">
        <a href="#inicio" class="atelier-mark"><img src="assets/favicon.png" width="28" height="28" alt="">Ateliê de memórias</a>
        <a class="header-contact" href="https://wa.me/5531983693238" target="_blank" rel="noopener noreferrer">Fale com a Amanda ${icon('arrow-up-right')}</a>
      </header>
      <div class="landing-content">
        <h1 id="brand-title"><img class="brand-logo" src="assets/brand-logo.webp" width="730" height="770" alt="Petalume — Arte &amp; Encanto" fetchpriority="high" loading="eager"></h1>
        <p class="landing-description">Flores, histórias e afetos.<br>Memórias que florescem para sempre.</p>
        <div class="landing-actions">
          <a class="primary-action" href="#pagina-5">Explorar catálogo ${icon('arrow-right')}</a>
          <a class="story-action" href="#pagina-2">Nossa história</a>
        </div>
        <p class="edition">Coleção Setembro / 2026</p>
      </div>
      <div class="memory-strip" aria-label="Peças Memora em resina">
        <a href="#pagina-6"><img src="assets/memora-blue.webp" width="796" height="780" alt="Memora P: flor azul eternizada em uma esfera de resina" loading="lazy"><span>Uma flor.</span></a>
        <a href="#pagina-6"><img src="assets/memora-pink.webp" width="808" height="788" alt="Memora M: flores cor-de-rosa preservadas em resina" loading="lazy"><span>Uma história.</span></a>
        <a href="#pagina-6"><img src="assets/memora-bouquet.webp" width="798" height="780" alt="Memora G: composição de flores coloridas em resina transparente" loading="lazy"><span>Para sempre.</span></a>
      </div>
      <div class="collection-note"><span>Arte que guarda o que importa.</span><a href="#pagina-2" aria-label="Conhecer a Petalume">${icon('arrow-down')}</a></div>
    </section>`;

const navigation = `
  <nav class="section-map" aria-label="Mapa do catálogo">
    <div class="map-inner">
      <div class="map-caption">
        <span class="map-breadcrumb"><span class="map-brand">Petalume <span class="caption-divider">/</span></span><span data-section-name>Início</span></span>
        <button class="subtopic-trigger" type="button" popovertarget="subtopic-menu" aria-label="Escolher subtópico" title="Escolher subtópico"><span data-subtopic-name>Apresentação</span><span class="subtopic-position" data-subtopic-count>1 / 1</span>${icon('chevron-down')}</button>
        <span class="section-count"><span data-section-count>01</span> / 08</span>
      </div>
      <div class="map-controls">
        <a class="map-arrow" href="#inicio" data-section-previous aria-label="Seção anterior" title="Seção anterior" aria-disabled="true">${icon('chevron-left')}</a>
        <div class="map-links">
${chapters.map((chapter, index) => `          <a class="map-link" href="#${chapter.id}" data-section-link data-label="${chapter.label}"${index === 0 ? ' aria-current="location"' : ''}><span class="map-number">${String(index + 1).padStart(2, '0')}</span><span class="map-label">${chapter.label}</span></a>`).join('\n')}
        </div>
        <a class="map-arrow" href="#pagina-2" data-section-next aria-label="Próxima seção" title="Próxima seção">${icon('chevron-right')}</a>
      </div>
    </div>
  </nav>`;

const sections = pages.map((page) => {
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
           loading="lazy" decoding="async">
${page.number > 1 && page.number < 32 ? `      <details class="page-reading"><summary>${icon('book-open')} Ler texto ${icon('chevron-down')}</summary><div class="reading-content"><h3>${heading}</h3>${text}</div></details>` : ''}
${page.number === 32 ? contactLinks : ''}
    </section>`;
}).join('\n');

const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f7f3e8">
  <title>Petalume | Arte &amp; Encanto</title>
  <meta name="description" content="Catalogo Petalume: eternizacao de buques, flores e memorias em resina. Conheca nossas pecas artesanais e joias afetivas.">
  <link rel="canonical" href="${siteUrl}">
  <link rel="icon" type="image/png" href="assets/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <script src="navigation.js" defer></script>
  <meta property="og:locale" content="pt_BR">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Petalume">
  <meta property="og:title" content="Petalume | Arte &amp; Encanto">
  <meta property="og:description" content="Flores e memorias eternizadas em pecas artesanais e joias afetivas.">
  <meta property="og:url" content="${siteUrl}">
  <meta property="og:image" content="${siteUrl}assets/pages/page-01-810.webp">
</head>
<body>
  <a class="skip-link" href="#pagina-5">Ir para o catalogo</a>
  <a class="skip-link skip-contact" href="#pagina-32">Ir para o contato</a>
${landing}
  <main aria-label="Catalogo Petalume - Setembro de 2026">
${sections}
  </main>
${navigation}
${subtopicMenu}
</body>
</html>
`;

await rm('_site', { recursive: true, force: true });
await mkdir('_site/assets/pages', { recursive: true });
await writeFile('_site/index.html', html);
await cp('styles.css', '_site/styles.css');
await cp('navigation.js', '_site/navigation.js');
await cp('assets/favicon.png', '_site/assets/favicon.png');
await mkdir('_site/assets/icons', { recursive: true });
for (const name of ['arrow-right', 'arrow-up-right', 'arrow-down', 'chevron-left', 'chevron-right', 'chevron-down', 'message-circle', 'mail', 'camera', 'book-open', 'x']) {
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
await sharp(logo.data, { raw: logo.info }).webp({ quality: 95 }).toFile('_site/assets/brand-logo.webp');
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
await writeFile('_site/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>\n`);
console.log(`Built Petalume: ${pages.length} pages in _site/`);