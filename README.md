# Human Comms Manifesto

This repository contains the canonical [Human Comms Manifesto](MANIFESTO.md), its public signatories, and the source for [humancomms.org](https://humancomms.org).

The manifesto exists to preserve human connection, authorship, judgment, accountability, and communication skill when AI is used around human-to-human communication.

## Repository guide

- [MANIFESTO.md](MANIFESTO.md) - the manifesto and **only source of truth for its text**.
- [SIGNING.md](SIGNING.md) - how individuals and organizations can adopt and sign it.
- [UNSIGNING.md](UNSIGNING.md) - how to remove a signature.
- `signatories/` - public signature records, merged through pull requests.
- `site/` - the static website, build scripts, research, and related-work pages.

The website is generated from `MANIFESTO.md` during CI. Do not duplicate or edit manifesto copy in the HTML template.

## Contributing to the manifesto

Changes to the manifesto are welcome, but should be deliberate because existing signatories adopted a particular text.

1. Fork the repository and create a branch.
2. Edit **only `MANIFESTO.md`** for manifesto wording changes.
3. Keep the writing concise, human-readable, and consistent with the manifesto's scope.
4. Open a pull request explaining what you changed and why.
5. Discuss substantial changes openly before merge.

Existing signatories should have a reasonable chance to review material changes and remove their signature if they no longer agree. See [SIGNING.md](SIGNING.md) for notification guidance and [UNSIGNING.md](UNSIGNING.md) for removal.

For website implementation details, see [site/README.md](site/README.md).
