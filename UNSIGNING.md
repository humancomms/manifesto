# Remove a Signature

You can withdraw your adoption of the Human Comms Manifesto at any time. No explanation is required.

## Individual

1. Fork the repository or update your existing fork.
2. Delete `signatories/individuals/<your-github-username>.json`.
3. Open a pull request titled `Remove signature: <your name>`.

The removal should be submitted by the same GitHub identity represented by the signature. If that account is no longer available, explain the identity change privately to a maintainer if needed.

## Organization

1. Delete the organization's file under `signatories/organizations/`.
2. Open a pull request titled `Remove organization signature: <organization name>`.

The request should come from an authorized representative. Moderators may verify authority where necessary.

## What removal means

Once the pull request is merged, the next site deployment removes the signature from the public signatory list.

Git repositories preserve history. The previous signature may remain visible in earlier commits even after it is removed from the current branch and website.
