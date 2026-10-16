# Petalume

The Petalume catalog, configured for https://petalume.art.br/.

This static site pairs a responsive, brand-led landing page with seven separate
catalog section pages: Sobre, Processo, Peças, Joias, Pagamento, Cuidados, and
Contato. The landing preserves the Petalume logo and product photographs and
includes a directory linking to every section.

A hamburger at the upper left opens a side menu with all sections and their
32 catalog-page destinations. Links within a section scroll to that page;
choosing another section opens its own HTML page. The menu is hidden until
opened, and no persistent bottom navigation covers the catalog.

The catalog artwork is preserved as responsive WebP images. Extracted page text
is retained for assistive technologies without adding a visible transcript
control. Contact details are rendered as responsive HTML with working WhatsApp,
email, and Instagram links. Printing retains all 32 original pages and hides the
website-specific opening and navigation.

A small local `navigation.js` closes the drawer after a destination is selected.
Section links and text alternatives for assistive technologies remain available
without JavaScript.
Lucide icons are bundled locally; Google Fonts are optional and have
serif/sans-serif fallbacks.

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

## Loading Performance

Livvic and Montserrat are bundled from the Fontsource development dependencies
and served locally as WOFF2 files with `font-display: swap`. Builds copy the font
licenses alongside the files. No Google Fonts stylesheet is needed at runtime.
The regular body font is preloaded, and the visible before/after photos load eagerly
with high fetch priority. The layout and original photos remain unchanged.

## Cloudflare Web Analytics

Analytics is optional and does not change the design, GitHub Pages hosting, or
Registro.br DNS. An unconfigured build adds no Cloudflare tracking script.

1. Open https://dash.cloudflare.com/?to=/:account/web-analytics and select
	**Add a site**. Enter `petalume.art.br` as the hostname.
2. Under **Manage site**, copy the JavaScript snippet for manual installation.
	Find the 32-character public `token` inside `data-cf-beacon`. This is a
	browser-visible site identifier, not a Cloudflare API token or password.
3. In the GitHub repository, open **Settings > Secrets and variables > Actions >
	Variables > New repository variable**. Set the name to
	`CLOUDFLARE_WEB_ANALYTICS_TOKEN` and the value to that public identifier only.
4. After the integration changes reach `main`, run **Deploy Petalume to GitHub
	Pages** using **Actions > Run workflow**. Changing a repository variable alone
	does not deploy the site. No manual HTML snippet or duplicate injection is needed.
5. Open the published site, navigate between sections, and check Cloudflare Web
	Analytics after a few minutes. Browser blockers can prevent measurements.

The build injects one deferred Cloudflare beacon before `</body>` on the home
page, every section page, and legacy URL aliases. Ordinary local builds omit it.
For a controlled local check, set `CLOUDFLARE_WEB_ANALYTICS_TOKEN` when building;
using a real identifier in a local preview can send test visits to the dashboard.
Remove the repository variable and redeploy to disable collection.

The dashboard provides aggregate traffic and performance data, not an exact
count of identifiable people. It does not recover visits from before installation.
Cloudflare's cookie-free approach does not remove the need to review applicable
privacy disclosures for the site.

Setup reference: https://developers.cloudflare.com/web-analytics/get-started/

## Custom Domain

The build uses `https://petalume.art.br/` for canonical URLs, sharing metadata,
robots, and the sitemap. This does not configure GitHub or DNS automatically.

1. Recommended: verify `petalume.art.br` under your GitHub account's Settings >
	Pages, adding the TXT record GitHub supplies at Registro.br.
2. In `luantafarel/petalume`, open Settings > Pages, enter `petalume.art.br`
	under Custom domain, and save it before pointing DNS to GitHub.
3. In Registro.br's DNS zone editor, add the following records. For apex
	records, leave the name empty if the editor appends `.petalume.art.br`.

| Type | Name | Value |
| --- | --- | --- |
| A | apex / @ | 185.199.108.153 |
| A | apex / @ | 185.199.109.153 |
| A | apex / @ | 185.199.110.153 |
| A | apex / @ | 185.199.111.153 |
| CNAME | www | luantafarel.github.io |

Replace conflicting website A/AAAA or www records, not unrelated MX/TXT email
records. Do not use a wildcard or include `/petalume` in the CNAME value.
If IPv6 is needed, add the four GitHub Pages AAAA records documented by GitHub.

4. Commit and push the website changes to `main`. The workflow rebuilds and
	deploys the updated metadata automatically.
5. After DNS and certificate provisioning finish, enable Enforce HTTPS in
	Settings > Pages. DNS propagation and HTTPS availability may take 24 hours.

This project deploys through GitHub Actions: a `CNAME` file in the repository
or build artifact is not required and does not replace the Pages setting.
GitHub handles the redirect from www to the apex when both are configured.

Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site