#!/usr/bin/env python3
"""
Builds the static inner pages of the main site.

  tools/layout/header.html   shared header (youth strip + nav)
  tools/layout/footer.html   shared footer + cookie banner
  tools/pages/<slug>.html    page content, starting with a front-matter comment:

      <!--
      title: אודות
      description: one sentence for search results / sharing
      section: about        (highlights the matching nav item)
      -->
      <main id="main"> ... </main>

Output: site/<slug>.html. It also refreshes the header/footer inside site/index.html
(between the @header / @footer markers) and adds a content hash to CSS/JS links so
browsers always load the latest files.

Run:  python3 tools/build.py
"""
import hashlib, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
LAYOUT = ROOT / 'tools' / 'layout'
PAGES = ROOT / 'tools' / 'pages'


def asset_hash():
    h = hashlib.sha1()
    for f in sorted((SITE / 'css').glob('*.css')) + sorted((SITE / 'js').glob('*.js')):
        h.update(f.read_bytes())
    return h.hexdigest()[:8]


def front_matter(text, name):
    m = re.match(r'\s*<!--(.*?)-->\s*', text, re.S)
    if not m:
        sys.exit(f'{name}: missing front-matter comment')
    meta = {}
    for line in m.group(1).strip().splitlines():
        if ':' in line:
            k, v = line.split(':', 1)
            meta[k.strip()] = v.strip()
    for key in ('title', 'description'):
        if key not in meta:
            sys.exit(f'{name}: front matter needs "{key}"')
    return meta, text[m.end():]


def mark_current(header, slug, section):
    # highlight the nav section, and mark the exact link as the current page
    if section:
        header = header.replace(f'data-section="{section}"', f'data-section="{section}" data-current', 1)
    return header.replace(f'<a href="{slug}.html">', f'<a href="{slug}.html" aria-current="page">')


def head(meta, v):
    title = meta['title'] if meta['title'].endswith('עמית לדרך') else f"{meta['title']} | עמית לדרך"
    return f'''<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><!-- preview build: remove at launch -->
<title>{title}</title>
<meta name="description" content="{meta['description']}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{meta['description']}">
<meta property="og:locale" content="he_IL">
<link rel="icon" href="assets/brand/symbol/compass-mark.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/Heebo-Variable.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="css/tokens.css?v={v}">
<link rel="stylesheet" href="css/base.css?v={v}">
<link rel="stylesheet" href="css/main.css?v={v}">
<link rel="stylesheet" href="css/pages.css?v={v}">
<script>document.documentElement.classList.add('js');</script>
<script src="js/cookies.js?v={v}" defer></script>
<script src="js/route-draw.js?v={v}" defer></script>
<script src="js/main.js?v={v}" defer></script>
</head>
<body class="inner">
'''


def main():
    v = asset_hash()
    header = (LAYOUT / 'header.html').read_text()
    footer = (LAYOUT / 'footer.html').read_text()
    built = []
    for page in sorted(PAGES.glob('*.html')):
        slug = page.stem
        meta, body = front_matter(page.read_text(), page.name)
        html = head(meta, v) + mark_current(header, slug, meta.get('section')) + '\n' + body.strip() + '\n\n' + footer + '</body>\n</html>\n'
        (SITE / f'{slug}.html').write_text(html)
        built.append(slug)

    # home page: refresh shared header/footer and asset versions
    index = SITE / 'index.html'
    s = index.read_text()
    s = re.sub(r'<!-- @header -->.*?<!-- /@header -->', lambda m: '<!-- @header -->\n' + header + '<!-- /@header -->', s, flags=re.S)
    s = re.sub(r'<!-- @footer -->.*?<!-- /@footer -->', lambda m: '<!-- @footer -->\n' + footer + '<!-- /@footer -->', s, flags=re.S)
    s = re.sub(r'((?:css|js)/[\w-]+\.(?:css|js))(\?v=[\w]+)?"', lambda m: f'{m.group(1)}?v={v}"', s)
    index.write_text(s)

    # youth mini-site: asset versions only
    young = SITE / 'young' / 'index.html'
    y = young.read_text()
    y = re.sub(r'(\.\./(?:css|js)/[\w-]+\.(?:css|js))(\?v=[\w]+)?"', lambda m: f'{m.group(1)}?v={v}"', y)
    young.write_text(y)

    print(f'built {len(built)} pages (assets v={v}): ' + ', '.join(built))


if __name__ == '__main__':
    main()
