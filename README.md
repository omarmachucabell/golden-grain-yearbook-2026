# Golden Grain Yearbook — frozen visitor site

Serve this folder as a static website, including GitHub Pages. Keep all relative paths intact. The uploader and manager are not required. Fonts, photo display files, capture dates, video posters, and visible videos are included. Upload dates are not substituted for missing capture dates.

This is a snapshot, not a live connection to the builder. Re-run the export after later edits. Session preferences remain in the visitor’s browser tab.

Site hosting access restrictions are not exported. A public GitHub Pages deployment makes its files public; choose hosting visibility before publishing. Do not add private hosting tokens or runtime credentials to this folder.

## Install in your existing GitHub Pages repository

1. Download BOTH ZIP files and extract both into the SAME empty folder. They are ordinary ZIPs containing different files; merge the folders when asked.
2. The resulting folder must contain index.html, .nojekyll, all other page files, and the assets folder together. Do not upload the ZIP files as the website.
3. Using GitHub Desktop, open or clone your golden-grain-yearbook-2026 repository. Copy these extracted contents into its publishing folder (normally the repository root). Replace older matching files.
4. Review the changes, commit, and push to the branch already used by GitHub Pages. Keep the existing Pages publishing configuration.
5. Open the published site after GitHub finishes deployment. For a local preview, run `python -m http.server 8000` in the extracted folder and visit http://localhost:8000. Do not preview by double-clicking HTML files; album and video JSON loading needs an HTTP server.

All files needed by this visitor site are included across the two ZIPs. Photo and video downloads remain disabled. The build-time uploader, editor backend, hosting credentials, deleted/hidden content, and redundant source copies are not needed or included. No further photo/video recompression was applied for this export.

The original hosting sign-in/access policy does not transfer to GitHub Pages. This package is the static visitor site; any client-side passcode is not a security boundary for public repository files.
