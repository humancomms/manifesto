# Human Comms website

Static website source for [humancomms.org](https://humancomms.org).

## Architecture

- [Tufte CSS](https://github.com/edwardtufte/tufte-css) provides the typography and responsive page layout. The site pins a specific upstream revision through jsDelivr.
- `assets/styles.css` contains only the small amount of site-specific styling needed for navigation, theme switching, heading anchors, and signature lists.
- `assets/theme.js` provides the light/dark toggle and remembers the visitor's choice.
- No application framework, database, CMS, analytics, or runtime backend.
- Signature records live under `../signatories/` and are reviewed through pull requests.
- `../MANIFESTO.md` is the only source of truth for manifesto text.
- `scripts/build.py` renders normal Markdown into the homepage at build time and generates paginated signature JSON.

`index.html` contains a `<!-- MANIFESTO_CONTENT -->` marker. Do not place manifesto copy directly in that template.

## Local build

From the repository root:

```sh
python -m pip install -r site/requirements.txt
node site/scripts/validate-signatories.mjs
python site/scripts/build.py
python3 -m http.server 8000 --directory dist
```

Then open `http://localhost:8000`.

## Security boundaries

Raw HTML in `MANIFESTO.md` is escaped. Mistune rejects harmful link protocols. Signatories cannot provide arbitrary website URLs; optional social identifiers are converted by the frontend into links to fixed GitHub, LinkedIn, or X origins.
