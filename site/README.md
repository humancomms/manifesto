# Human Comms website

Static website source for [humancomms.org](https://humancomms.org).

## Architecture

- Plain HTML and CSS with a small vanilla JavaScript module for paginated signature lists.
- No framework, package manager, database, CMS, analytics, or runtime backend.
- Light and dark themes follow the visitor's operating-system preference.
- Signature records live under `../signatories/` and are reviewed through pull requests.
- `../MANIFESTO.md` is the only source of truth for manifesto text.
- `scripts/build.mjs` safely renders the supported Markdown subset into the homepage at build time and generates paginated signature JSON.

`index.html` contains a `<!-- MANIFESTO_CONTENT -->` marker. Do not place manifesto copy directly in that template.

## Local build

From the repository root:

```sh
node site/scripts/validate-signatories.mjs
node site/scripts/build.mjs
python3 -m http.server 8000 --directory dist
```

Then open `http://localhost:8000`.

## Security boundaries

The Markdown renderer escapes raw HTML and only creates links for `http`, `https`, or root-relative URLs. Signatories cannot provide arbitrary website URLs; optional social identifiers are converted by the frontend into links to fixed GitHub, LinkedIn, or X origins.
