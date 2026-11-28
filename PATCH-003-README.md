# Golden Grain — Patch 003

Required base: the complete GitHub export with Patches 001 and 002 applied.

## Apply

1. Extract this ZIP to a temporary folder.
2. Copy its contents into your GitHub Desktop repository folder, beside index.html. Merge the .yearbook folder and replace matching files; do not replace the repository folder itself.
3. Keep your existing CNAME file and GitHub Pages settings. This patch does not include or change either.
4. In GitHub Desktop, review the changes, commit, and Push origin. Wait for GitHub Pages to finish deploying, then refresh Weekly Spotlight.

Do not commit the ZIP itself. No files need deleting. This patch does not publish automatically.

## Changes

- Alejandra: “Expect nothing, appreciate everything”
- Paris: “Always choose to spread love and kindness.”

Replaces only their “Quote coming soon.” placeholders in the existing quote frames. All other page content, photos, styling, and behavior are preserved. No media files are included.

## Validation

Checked the exact quote text, the matching honoree sections and attribution, and removal of both placeholders. Reversing the two quote substitutions reproduces the original page byte for byte. Existing media and script references are unchanged. No browser rendering test was performed for this text-only edit.

The patch manifest records the original and replacement file hashes. Size tracking builds on Patch 002's exported-site inventory and excludes Git history, ZIP archives, and any files added separately (including the custom-domain CNAME).
