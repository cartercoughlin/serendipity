# Serendipity

Serendipity is a Chrome extension for making search less self-reinforcing. It
does not pretend to erase platform memory. Instead, it creates room for
unexpected discovery by doing two practical things:

- It can re-run Google searches with `pws=0` to reduce personalized search bias.
- It injects "off-vector" search pivots directly into the results page so you can
  branch into adjacent, contrarian, reflective, or random directions.

## What it does

- Manifest V3 extension with a popup and Google Search content script
- Current host scope is `google.com` only
- Toggle to enable or disable the intervention layer
- Optional automatic depersonalization on Google Search
- Adjustable serendipity intensity from 1 to 5
- Four remix engines:
  - Adjacent
  - Contrarian
  - Reflective
  - Random

## Load locally

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click `Load unpacked`
4. Select this folder

## Package it

Run:

```bash
bash scripts/validate.sh
bash scripts/package.sh
```

Artifacts are written to:

- `dist/serendipity/`
- `dist/serendipity-extension.zip`

## Test it

1. Load the unpacked extension from this repo or from `dist/serendipity/`
2. Open a Google search such as `https://www.google.com/search?q=running+shoes`
3. Confirm the page reloads with `pws=0` when auto-depersonalize is enabled
4. Confirm the "Serendipity mode" panel appears above results
5. Toggle intensity and remix engines from the popup and verify the results page reloads
6. Click a few variant queries and confirm they open Google searches with modified framing

## Chrome Web Store

Submission prep materials live in `submission/`:

- `submission/STORE_LISTING.md`
- `submission/PRIVACY.md`
- `submission/REVIEW_NOTES.md`

Build the upload package with:

```bash
bash scripts/package.sh
```

Then upload `dist/serendipity-extension.zip` in the Chrome Developer Dashboard.

## What to look for during testing

- With the extension enabled, query pivots should change as intensity changes
- With `adjacent` off, no adjacent cards should appear
- With `contrarian` off, no contrarian cards should appear
- With `random` off, no random cross-domain pivots should appear
- With the extension disabled, the panel should not render
- With auto-depersonalize off, the URL should no longer be forced to include `pws=0`

## Current limitation

This version works at the query and result-page layer. It does not spoof your
identity, click history, signed-in state, or browser fingerprint. That is
intentional: the first useful version should improve discovery without stepping
into brittle or deceptive behavior.

It also only works on standard Google web pages. Chrome-hosted internal
surfaces such as `chrome://contextual-tasks` cannot be modified by extensions,
so those experiences are out of scope for this version.
