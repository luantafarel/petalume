# Petalume

The Petalume catalog, published at https://luantafarel.github.io/petalume/.

This static site preserves all 32 pages of the September 2026 PDF as responsive
WebP artwork. Page layouts, photographs, typography, and backgrounds come directly
from the supplied catalog rather than approximations in HTML. Extracted text is
included for screen readers and search engines. The contact page includes working
WhatsApp, email, and Instagram links. There is no client-side JavaScript.

## Build and Preview

Use Node.js 22 or newer:

```sh
npm ci
npm run build
npm test
open _site/index.html
```

The site needs no development server. `_site/` contains the complete deployable
site, including relative asset paths that work under a GitHub Pages project URL.

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

Text in the visible catalog is baked into the artwork to preserve the exact
design. To change its copy, prices, or layout, edit the source PDF and regenerate
the assets. If page ordering, page count, or contact placement changes, update
the headings in `scripts/build.mjs`, contact regions in `styles.css`, and tests.

## GitHub Pages

In the repository settings, select **GitHub Actions** as the Pages source.
The workflow is `.github/workflows/pages.yml` and publishes only `_site/`, not
the source PDF, intermediate JPEGs, build tools, or development dependencies.