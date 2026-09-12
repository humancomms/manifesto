# Human Comms website

Static website source for [humancomms.org](https://humancomms.org).

## Architecture

- Plain HTML and CSS with small vanilla JavaScript modules for theme switching and paginated signature lists.
- No frontend framework, database, CMS, analytics, or runtime backend.
- Light and dark themes follow the visitor's operating-system preference unless manually overridden.
- Signature records live under `../signatories/` and are reviewed through pull requests.
- `../MANIFESTO.md` is the only source of truth for manifesto text.
- `scripts/build.py` renders standard Markdown into the homepage at build time, adds stable heading anchors, generates paginated signature JSON, and fingerprints CSS/JS references to avoid stale cached assets.

`index.html` contains a `<!-- MANIFESTO_CONTENT -->` marker. Do not place manifesto copy directly in that template.

## Markdown

`MANIFESTO.md` can be edited as normal Markdown. The renderer supports headings, paragraphs, emphasis, links, ordered and unordered lists, task lists, blockquotes, code blocks, tables, horizontal rules, automatic URLs, and footnotes. Heading anchor links are generated automatically.

Raw HTML is escaped rather than executed. This keeps manifesto contributions content-focused and avoids turning Markdown edits into arbitrary page-script execution.

## Local build

From the repository root:

```sh
python3 -m pip install -r site/requirements.txt
node site/scripts/validate-signatories.mjs
python3 site/scripts/build.py
python3 -m http.server 8000 --directory dist
```

Then open `http://localhost:8000` and visually inspect both desktop and mobile layouts before deploying.

## Security boundaries

The Markdown renderer escapes raw HTML and rejects harmful URL protocols. Signatories cannot provide arbitrary website URLs; optional social identifiers are converted by the frontend into links to fixed GitHub, LinkedIn, or X origins.
