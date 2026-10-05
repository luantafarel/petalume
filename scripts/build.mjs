import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const pages = JSON.parse(await readFile('assets/catalog.json', 'utf8'));
const siteUrl = 'https://luantafarel.github.io/petalume/';
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

const headings = [
  'Petalume - Arte & Encanto', 'Sobre a Petalume', 'Memorias que podemos eternizar',
  'Processo de eternizacao', 'Catalogo - Modelos e variacoes', 'Memora', 'Aurea',
  'Flora', 'Prisma', 'Prisma XG e Amora', 'Floratta e Quadro Elora',
  'Kits Petalia e Serena', 'Quadro Liria', 'Porta-joias', 'Signa, Lume e Elo Baby',
  'Ninho', 'Joias afetivas', 'Linha Lume - Folheado', 'Linha Enlace - Folheado',
  'Linha Alma - Folheado', 'Linha Enlace - Prata 925', 'Pulseiras e correntes',
  'Formas de pagamento', 'Informacoes importantes', 'Preservacao das flores',
  'Transformacoes naturais das flores', 'Transformacoes naturais da resina',
  'Sobre buques aramados', 'Sobre arranjos com lirios', 'Cuidados com sua peca',
  'Cada peca e unica', 'Contato',
];

const contactLinks = `
      <a class="contact-link whatsapp" href="https://wa.me/5531983693238" target="_blank" rel="noopener noreferrer" aria-label="Conversar com a Petalume pelo WhatsApp: (31) 9 8369-3238" title="WhatsApp"></a>
      <a class="contact-link email" href="mailto:petalumeatelier@gmail.com" aria-label="Enviar e-mail para petalumeatelier@gmail.com" title="E-mail"></a>
      <a class="contact-link instagram" href="https://www.instagram.com/petalumeatelier/" target="_blank" rel="noopener noreferrer" aria-label="Visitar @petalumeatelier no Instagram" title="Instagram"></a>`;

const sections = pages.map((page) => {
  const number = String(page.number).padStart(2, '0');
  const heading = escapeHtml(headings[page.number - 1]);
  const text = page.text.split('\n').map((line) => `          <p>${escapeHtml(line)}</p>`).join('\n');
  return `    <section class="catalog-page" id="pagina-${page.number}" aria-labelledby="titulo-${page.number}">
      <div class="accessible-text">
        <${page.number === 1 ? 'h1' : 'h2'} id="titulo-${page.number}">${heading}</${page.number === 1 ? 'h1' : 'h2'}>
${text}
      </div>
      <img src="assets/pages/page-${number}-810.webp"
           srcset="assets/pages/page-${number}-810.webp 810w, assets/pages/page-${number}-1620.webp 1620w"
           sizes="(max-width: 810px) 100vw, 810px"
           width="810" height="1440" alt="" aria-hidden="true"
           loading="${page.number === 1 ? 'eager' : 'lazy'}" decoding="async"${page.number === 1 ? ' fetchpriority="high"' : ''}>
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
  <link rel="stylesheet" href="styles.css">
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
  <main aria-label="Catalogo Petalume - Setembro de 2026">
${sections}
  </main>
</body>
</html>
`;

await rm('_site', { recursive: true, force: true });
await mkdir('_site/assets/pages', { recursive: true });
await writeFile('_site/index.html', html);
await cp('styles.css', '_site/styles.css');
await cp('assets/favicon.png', '_site/assets/favicon.png');
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