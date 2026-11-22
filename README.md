# Amit LaDerech - website

Static website for the nonprofit **עמית לדרך (Amit LaDerech)**, built by Moveo Creative.
Plain HTML/CSS/JS, Hebrew RTL. This is the working design + content build; it will be moved to React.

- Live preview: https://edennis-web.github.io/amit-laderech/ (youth site: `/young/`)
- `site/` - what gets published
  - `index.html` - home page (hand-made)
  - `young/` - mini-site for discharged soldiers (hand-made; mobile-first feed, desktop tile wall)
  - all other `*.html` - inner pages, **generated** (see below)
  - `css/` - `tokens.css` (brand tokens), `base.css`, `main.css` (home + shared), `pages.css` (inner pages), `young.css`
  - `js/` - `main.js` (nav, reveal, counters, hero road), `route-draw.js` (brand route-line animation), `cookies.js` (consent), `young.js`
  - `assets/` - brand logos/shapes/patterns, fonts (Heebo, Montserrat - OFL), photos
- `tools/` - page sources and scripts
  - `layout/header.html`, `layout/footer.html` - shared header/footer (also injected into `index.html`)
  - `pages/<slug>.html` - content of each inner page
  - `build.py` - builds the inner pages and refreshes header/footer + asset versions
  - `check_links.py` - checks every internal link and anchor (`--external` also checks outside links)
  - `PAGES.md` - how to write a page, building blocks, **full site map and outside links (forms, donations)**

## Work on it

```bash
python3 tools/build.py          # after editing tools/pages, tools/layout, css or js
python3 tools/check_links.py    # must say "all good"
cd site && python3 -m http.server 4400
```

Or double-click `פתיחת האתר.command` (macOS) and open http://localhost:4400/

## Moving to React

- Routes = the site map table in `tools/PAGES.md` (file name = route, e.g. `team.html` -> `/team`).
  The youth site is its own route tree (`/young`). Keep `/landing-page-v2` unchanged on the production domain.
- Components map 1:1 to the building blocks in `PAGES.md` (PageHero, AnchorNav, Cards, Tiles, People, DocList,
  LinkList, PullQuote, CtaBand, Notice, MediaSlot) plus Header/Footer from `tools/layout`.
- Design tokens: `site/css/tokens.css`. Brand rules: panels square, buttons radius 4px, photos B&W or orange duotone.
- Photos and videos are placeholders where marked (`media-slot`, initials avatars, logo wall) - to be replaced.

## Before launch

- Remove the `noindex` meta tags and `site/robots.txt` (preview only).
- Legal pages (privacy, terms, accessibility) are waiting for the lawyer's text.
- Confirm photo usage consent with the association.
- No marketing pixels or social embeds load before cookie consent (`js/cookies.js`, `AmitConsent.onGrant`).
