import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const site = path.join(root, 'site');
const output = path.join(root, 'dist');
const pageSize = 200;
const manifestoMarker = '<!-- MANIFESTO_CONTENT -->';

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInline(value) {
  let text = escapeHtml(value);

  text = text.replace(/\[([^\]]+)]\(([^)]+)\)/g, (match, label, href) => {
    const decodedHref = href.replaceAll('&amp;', '&');
    const safe = decodedHref.startsWith('/') || /^https?:\/\//i.test(decodedHref);
    if (!safe) return label;
    const rel = decodedHref.startsWith('/') ? '' : ' rel="noopener noreferrer"';
    return `<a href="${escapeHtml(decodedHref)}"${rel}>${label}</a>`;
  });

  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  return text;
}

function renderMarkdown(markdown) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const html = ['<section class="hero">'];
  let paragraph = [];
  let list = [];
  let inHero = true;
  let heroParagraphCount = 0;

  function flushParagraph() {
    if (paragraph.length === 0) return;
    const rendered = paragraph.map((line) => {
      const hardBreak = / {2,}$/.test(line);
      const value = renderInline(line.trimEnd());
      return hardBreak ? `${value}<br>` : value;
    }).join(' ');

    let className = '';
    if (inHero) {
      heroParagraphCount += 1;
      if (heroParagraphCount === 1) className = ' class="lede"';
      if (/^<em>.*<\/em>$/.test(rendered)) className = ' class="punchline"';
    } else if (/^<em>.*<\/em>$/.test(rendered)) {
      className = ' class="punchline"';
    }

    html.push(`<p${className}>${rendered}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (list.length === 0) return;
    html.push('<ul>');
    for (const item of list) html.push(`  <li>${renderInline(item)}</li>`);
    html.push('</ul>');
    list = [];
  }

  for (const rawLine of lines) {
    const line = rawLine;

    if (line.trim() === '') {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      if (level === 2) {
        html.push('</section>', '<section>');
        inHero = false;
      }
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = /^-\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }

    if (list.length > 0) flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  html.push('</section>');
  return html.join('\n');
}

async function readSignatures(kind) {
  const directory = path.join(root, 'signatories', kind);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name);

  const signatures = [];
  for (const file of files) {
    const content = await readFile(path.join(directory, file), 'utf8');
    signatures.push(JSON.parse(content));
  }

  return signatures.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

async function writeSignaturePages(kind) {
  const signatures = await readSignatures(kind);
  const target = path.join(output, 'signatures', 'data', kind);
  const pages = Math.ceil(signatures.length / pageSize);
  await mkdir(target, { recursive: true });

  await writeFile(
    path.join(target, 'index.json'),
    JSON.stringify({ count: signatures.length, pages, pageSize }),
  );

  for (let index = 0; index < pages; index += 1) {
    const page = signatures.slice(index * pageSize, (index + 1) * pageSize);
    await writeFile(path.join(target, `page-${index + 1}.json`), JSON.stringify(page));
  }
}

await rm(output, { recursive: true, force: true });
await cp(site, output, { recursive: true });
await rm(path.join(output, 'README.md'), { force: true });
await rm(path.join(output, 'scripts'), { recursive: true, force: true });

const manifesto = await readFile(path.join(root, 'MANIFESTO.md'), 'utf8');
const homepagePath = path.join(output, 'index.html');
const homepage = await readFile(homepagePath, 'utf8');
if (!homepage.includes(manifestoMarker)) throw new Error(`Missing ${manifestoMarker} in site/index.html`);
await writeFile(homepagePath, homepage.replace(manifestoMarker, renderMarkdown(manifesto)));

await writeFile(path.join(output, '.nojekyll'), '');
await writeFile(path.join(output, 'CNAME'), 'humancomms.org\n');
await writeSignaturePages('individuals');
await writeSignaturePages('organizations');

console.log('Built site in dist/ from MANIFESTO.md');
