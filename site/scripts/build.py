from __future__ import annotations

import hashlib
import html
import json
import re
import shutil
from pathlib import Path

import mistune

ROOT = Path.cwd()
SITE = ROOT / 'site'
OUTPUT = ROOT / 'dist'
PAGE_SIZE = 200
MANIFESTO_MARKER = '<!-- MANIFESTO_CONTENT -->'


class ManifestoRenderer(mistune.HTMLRenderer):
    def __init__(self) -> None:
        super().__init__(escape=True, allow_harmful_protocols=False)
        self._used_ids: dict[str, int] = {}

    def heading(self, text: str, level: int, **attrs) -> str:
        label = html.unescape(re.sub(r'<[^>]+>', '', text)).strip()
        base = re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-') or 'section'
        count = self._used_ids.get(base, 0) + 1
        self._used_ids[base] = count
        slug = base if count == 1 else f'{base}-{count}'
        aria = html.escape(f'Link to {label}', quote=True)
        return f'<h{level} id="{slug}">{text}<a class="heading-anchor" href="#{slug}" aria-label="{aria}">#</a></h{level}>\n'

    def link(self, text: str, url: str, title=None) -> str:
        rendered = super().link(text, url, title)
        if url.startswith(('http://', 'https://')):
            rendered = rendered.replace('<a ', '<a rel="noopener noreferrer" ', 1)
        return rendered


def render_manifesto(markdown_text: str) -> str:
    renderer = ManifestoRenderer()
    markdown = mistune.create_markdown(
        renderer=renderer,
        escape=True,
        plugins=['strikethrough', 'table', 'footnotes', 'task_lists', 'url'],
    )
    return markdown(markdown_text)


def read_signatures(kind: str) -> list[dict]:
    directory = ROOT / 'signatories' / kind
    signatures = []
    for file in sorted(directory.glob('*.json')):
        signatures.append(json.loads(file.read_text(encoding='utf-8')))
    return sorted(signatures, key=lambda item: item['name'].casefold())


def write_signature_pages(kind: str) -> None:
    signatures = read_signatures(kind)
    target = OUTPUT / 'signatures' / 'data' / kind
    target.mkdir(parents=True, exist_ok=True)
    pages = (len(signatures) + PAGE_SIZE - 1) // PAGE_SIZE
    (target / 'index.json').write_text(
        json.dumps({'count': len(signatures), 'pages': pages, 'pageSize': PAGE_SIZE}, separators=(',', ':')),
        encoding='utf-8',
    )
    for index in range(pages):
        page = signatures[index * PAGE_SIZE:(index + 1) * PAGE_SIZE]
        (target / f'page-{index + 1}.json').write_text(json.dumps(page, separators=(',', ':')), encoding='utf-8')


def asset_version(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:12]


def bust_assets() -> None:
    versions = {
        '/assets/styles.css': asset_version(OUTPUT / 'assets' / 'styles.css'),
        '/assets/theme.js': asset_version(OUTPUT / 'assets' / 'theme.js'),
        '/assets/logo-light.svg': asset_version(OUTPUT / 'assets' / 'logo-light.svg'),
        '/assets/logo-dark.svg': asset_version(OUTPUT / 'assets' / 'logo-dark.svg'),
        '/assets/favicon.svg': asset_version(OUTPUT / 'assets' / 'favicon.svg'),
    }
    for page in OUTPUT.rglob('*.html'):
        content = page.read_text(encoding='utf-8')
        for asset, version in versions.items():
            content = content.replace(asset, f'{asset}?v={version}')
        page.write_text(content, encoding='utf-8')


def build() -> None:
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    shutil.copytree(SITE, OUTPUT)
    shutil.rmtree(OUTPUT / 'scripts', ignore_errors=True)
    for file_name in ('README.md', 'requirements.txt'):
        (OUTPUT / file_name).unlink(missing_ok=True)

    manifesto = (ROOT / 'MANIFESTO.md').read_text(encoding='utf-8')
    homepage_path = OUTPUT / 'index.html'
    homepage = homepage_path.read_text(encoding='utf-8')
    if MANIFESTO_MARKER not in homepage:
        raise RuntimeError(f'Missing {MANIFESTO_MARKER} in site/index.html')
    homepage_path.write_text(homepage.replace(MANIFESTO_MARKER, render_manifesto(manifesto)), encoding='utf-8')

    (OUTPUT / '.nojekyll').write_text('', encoding='utf-8')
    (OUTPUT / 'CNAME').write_text('humancomms.org\n', encoding='utf-8')
    write_signature_pages('individuals')
    write_signature_pages('organizations')
    bust_assets()
    print('Built site in dist/ from MANIFESTO.md')


if __name__ == '__main__':
    build()
