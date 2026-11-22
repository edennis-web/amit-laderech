#!/usr/bin/env python3
"""
Checks every link in site/*.html and site/young/index.html:
  - internal links must point to an existing file, and #anchors must exist on that page
  - external links are listed (and checked with --external)
  - flags forbidden characters: long dashes, Hebrew maqaf, arrows

Run:  python3 tools/check_links.py [--external]
"""
import html.parser, pathlib, re, sys, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
BAD_CHARS = re.compile('[—–־←→↗]')


class Links(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.add(a['id'])
        if tag == 'a' and 'href' in a:
            self.links.append(a['href'])


def parse(path):
    p = Links()
    p.feed(path.read_text())
    return p


def main():
    pages = sorted(SITE.glob('*.html')) + [SITE / 'young' / 'index.html']
    parsed = {pg: parse(pg) for pg in pages}
    errors, external = [], set()
    for pg, p in parsed.items():
        rel = pg.relative_to(SITE)
        text = pg.read_text()
        visible = re.sub(r'<(script|style)[^>]*>.*?</\1>|<!--.*?-->', '', text, flags=re.S)
        for m in BAD_CHARS.finditer(visible):
            errors.append(f'{rel}: forbidden character {m.group()!r} near "{visible[max(0, m.start()-30):m.start()+10]}"')
        for href in p.links:
            if href.startswith(('mailto:', 'tel:', 'javascript:')):
                continue
            if href.startswith(('http://', 'https://')):
                external.add(href)
                continue
            url, _, frag = href.partition('#')
            target = (pg.parent / urllib.parse.unquote(url)).resolve() if url else pg
            if target.is_dir():
                target = target / 'index.html'
            if not target.exists():
                errors.append(f'{rel}: broken link "{href}"')
                continue
            if frag and target in parsed and frag not in parsed[target].ids:
                errors.append(f'{rel}: missing anchor "{href}"')
    if '--external' in sys.argv:
        for url in sorted(external):
            try:
                req = urllib.request.Request(urllib.parse.quote(url, safe=':/?=&%#@+,;~'), headers={'User-Agent': 'Mozilla/5.0'})
                code = urllib.request.urlopen(req, timeout=15).status
            except Exception as e:
                code = getattr(e, 'code', str(e)[:40])
            if code != 200:
                errors.append(f'external {url} -> {code}')
    print(f'{len(pages)} pages, {sum(len(p.links) for p in parsed.values())} links, {len(external)} external')
    print('\n'.join(errors) if errors else 'all good')
    sys.exit(1 if errors else 0)


if __name__ == '__main__':
    main()
