# Golden Grain 2026 — GitHub export

## Publish the yearbook

1. Extract this ZIP.
2. Put the contents of `Golden-Grain-2026-GitHub` in your GitHub repository, preserving the folders. GitHub Desktop is convenient for uploading the whole folder.
3. Commit and push to `main`.
4. In the repository, open **Settings → Pages**. Select **Deploy from a branch**, `main`, and `/docs`, then save.
5. The homepage is `docs/index.html`. All page paths stay relative, including on a project URL such as `/golden-grain-yearbook-2026/`.

## Included

- `docs/`: static website for GitHub Pages, all 15 HTML pages, styles, JavaScript, animations, and committed image assets.
- `source/yearbook/`: complete tracked yearbook source, including photo-manager UI, Worker backend, build scripts, tests, seed catalog, and hosting configuration.
- `source/uploader/`: complete tracked standalone uploader source and tests/build scripts.
- `download-uploads.py`: optional Python 3 script to retrieve original inbox files through the existing passcode-protected uploader. It prompts for your passcode; none is included in this archive.

## Important limits

This archive contains the committed project files, not a backup of live cloud storage. Newly uploaded inbox originals, private sessions, live/draft photo-manager catalogs, and runtime secrets are NOT included. A direct download attempt was blocked with HTTP 403. The optional downloader uses the same login and paginated listing API; its live success has not been verified. If it is blocked too, use the hosted uploader to access your originals. Keep your original photos and the hosted site until the transfer is verified.

The static pages are the committed HTML version. Changes made only through the hosted photo manager after that version cannot be assumed to be included. Existing placeholders remain where no photograph was assigned.

GitHub Pages serves static files; it cannot run the uploader or photo-manager Worker backend. The temporary Admin Login link is removed ONLY from `docs/index.html`; the original remains in the source backup. No live site changes were made. To run those backends elsewhere, provision compatible Worker/R2 hosting and supply runtime secrets separately. The two included `.openai/hosting.json` files document the original hosting bindings; they are not GitHub deployment settings. Never commit real passcodes or tokens.

Fonts continue to load from Google Fonts, as in the original website. No new gallery organization or design changes were made.

## Local preview

Run `python -m http.server 8000 --directory docs` from this folder, then open `http://localhost:8000`.

## Upload-original backup

Run `python download-uploads.py`, then enter your uploader passcode. Files go into `uploads/`, with names mapped in `uploads/manifest.json`. Downloading does not automatically place them into galleries; copy chosen files into `docs/assets/` and update the relevant page paths when ready.

## Source revisions

Yearbook: c4566be2f301eac89253d363e7825c725dcd7981
Uploader: 846a1b699e4ce887b92801a5e41d9df565d762d6
