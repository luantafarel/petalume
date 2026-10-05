# Petalume

The Petalume catalog, published at https://luantafarel.github.io/petalume/.

This static site pairs a responsive, brand-led opening with the September 2026
catalog. The opening uses the original Petalume logo and product photographs,
with a fixed bottom map for eight sections: Inicio, Sobre, Processo, Pecas, Joias,
Pagamento, Cuidados, and Contato. Previous/next arrows behave like chapter
pagination; the active chapter follows scrolling and stays visible on mobile.

The catalog artwork is preserved as responsive WebP images. Each interior page
also offers a native "Ler texto" disclosure for reading copy and prices at a
comfortable text size. Contact details are rendered as responsive HTML with
working WhatsApp, email, and Instagram links. Printing retains all 32 original
pages and hides the website-specific opening and navigation.

A small local `navigation.js` enhances the section map. Anchor links and text
disclosures still work without JavaScript. Lucide icons are bundled locally;
Google Fonts are optional and have serif/sans-serif fallbacks.

## Build and Preview

Use Node.js 22 or newer:

```sh
npm ci
npm run build
npm test
open _site/index.html
```

The site needs no application server. `_site/` contains the complete deployable
site, including relative asset paths that work under a GitHub Pages project URL.
For browser testing, serve this folder with a lightweight local HTTP server.
Normal builds use only existing WebP files; they do not reprocess the large PDF.

## Update the Catalog

Place the updated PDF in the project root with the name `Catálogo Petalume.pdf`.
The original PDF is intentionally excluded from Git because it is 181 MB.
Regenerating its artwork requires macOS with Swift, AppKit, and PDFKit:

```sh
npm ci
npm run assets
npm run build
npm test
```

Commit the updated WebP files and `assets/catalog.json`, then push to `main`.
GitHub Actions builds, tests, and deploys the site automatically. Normal builds
do not need the PDF, Swift, or macOS.

Text in the catalog artwork is baked into its images. To change prices or page
layouts, edit the source PDF and regenerate the assets. The readable text comes
from `assets/catalog.json`. Website copy, chapter destinations, logo/photo crops,
and contact links live in `scripts/build.mjs`; presentation is in `styles.css`.
If page ordering or count changes, update the headings, chapters, and tests.

## GitHub Pages

In the repository settings, select **GitHub Actions** as the Pages source.
The workflow is `.github/workflows/pages.yml` and publishes only `_site/`, not
the source PDF, intermediate JPEGs, build tools, or development dependencies.