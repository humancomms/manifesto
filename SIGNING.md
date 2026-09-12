# Sign the Human Comms Manifesto

Signatures are public GitHub pull requests. No account system or private database is used.

Before signing, read the current [MANIFESTO.md](MANIFESTO.md). By submitting a signature you are stating that you have read and adopted that text.

## Individual

1. Fork this repository.
2. Copy `signatories/templates/individual.json` to `signatories/individuals/<your-github-username>.json`. Use your GitHub username in lowercase for the filename.
3. Replace the values with your own identity. `linkedin` and `x` are optional and may be removed.
4. Open a pull request against `main`.

The `github` identity must be yours. Arbitrary website URLs are intentionally not accepted.

## Organization

1. Fork this repository.
2. Copy `signatories/templates/organization.json` to `signatories/organizations/<organization-name>.json` using lowercase kebab-case.
3. Replace the values. `github`, `linkedin`, and `x` are optional and may be removed.
4. Open a pull request against `main`.

`signedBy` must be the GitHub username of a person authorized to make the adoption statement on behalf of the organization. Moderators may ask for evidence of that authority before merging.

## Stay informed about manifesto changes

A signature applies to the manifesto text you chose to adopt. If that text changes materially, you may want to reconsider your signature.

GitHub does not provide file-specific notifications. To receive notice of proposed manifesto changes, use the repository's **Watch** menu and subscribe to **Pull requests** or **All Activity**. Manifesto wording changes should be proposed through pull requests before they are merged.

If a future version no longer represents your position, you can remove your signature at any time. See [UNSIGNING.md](UNSIGNING.md).

## Moderation and public history

Signatures are reviewed before merge. Duplicate, misleading, impersonating, promotional, or unverifiable submissions may be declined.

Signature records are public Git history. Removing a signature removes it from the current website and branch, but the historical commit may remain visible in Git history.
