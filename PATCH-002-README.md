# Golden Grain — Patch 002

Required base: Patch 001 applied to the complete two-part GitHub export. Apply Patch 001 first, including its photo-file cleanup. This patch is for your existing repository; it is not a complete standalone site.

## Apply

1. Extract this ZIP into your repository root, beside index.html.
2. Merge assets and .yearbook; replace matching files. Keep the existing contents of assets. There are no files to delete for Patch 002.
3. Review the changes in GitHub Desktop, commit, then Push origin. Do not commit this ZIP itself.

The patch does not deploy automatically. It does not change your Pages publishing configuration.

## Changes

- Adds all 20 supplied Kolby Roe photographs to the Photo Album.
- Places crew photos in The Crew, rides and loading in Life at the Raceway, and scenery in Around the Farm. Six crew ride photos belong to both relevant topics; they share one physical image file.
- Adds the last-day crew group to the album highlights and includes the other photos in matching highlights.
- Displays a clickable “Photos by Kolby Roe” beneath the caption when any of these 20 photos is open. The link opens https://roephotography10.mypixieset.com/ in a new tab.
- Searching for “Kolby Roe” returns this set. Team-member filtering includes the people named in the supplied filenames.
- Keeps the uploaded 2048-pixel long edge and original color profiles. Adds one WebP per photo, with no changes to older photo or video quality.
- No capture dates were present in the uploads. These photos have no invented timestamp and follow the album's existing undated-photo sorting behavior.

## Size and validation

New media: 5,998,380 bytes. Complete site after the checkpoint and Patches 001–002: 899,911,424 bytes (about 899.91 MB), including retained patch documentation. This is below the 900,000,000-byte budget. Git history, download ZIPs, and any additional files you have added are excluded.

Checked all 20 assets, original-file hashes, image dimensions and color profiles, catalog references, unchanged older records, and JavaScript syntax. Browser checks covered the highlight collection, linked credit, existing-photo credit isolation, photographer search, topic filters, team-member filtering, and date sorting. New topic counts are 9 crew, 10 raceway, and 7 around the farm, with overlap as described above.

The exact file changes and old/new SHA-256 hashes are in .yearbook/patch-002.json. The per-photo source and conversion audit is in .yearbook/patch-002-photos.json. The working deployment remains unconfirmed until you apply, commit, push, and GitHub Pages finishes successfully.
