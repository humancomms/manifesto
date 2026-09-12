# Human Comms Manifesto

Source for [humancomms.org](https://humancomms.org), the manifesto, research references, similar work, and public signatories.

## Architecture

- Plain HTML and CSS, with a small vanilla JavaScript module for paginated signature lists.
- No framework, database, CMS, analytics, or runtime backend.
- Signatures live as one JSON file per adopter under `signatories/` and are reviewed through pull requests.
- `scripts/build.mjs` copies the static site and generates paginated signature JSON.
- GitHub Actions validates signatures and deploys `dist/` to GitHub Pages.
- Light and dark themes follow the visitor's operating-system preference.

## Local build

```sh
node scripts/validate-signatories.mjs
node scripts/build.mjs
python3 -m http.server 8000 --directory dist
```

Then open `http://localhost:8000`.

## Sign the manifesto

See [SIGNING.md](SIGNING.md).
