# Golden Grain — Patch 001

Required base: baseline-000 (the complete November 25 two-part GitHub export). No earlier content patches are required. This does not publish anything automatically.

Removes the photo captioned “A coworker’s visit with Sophia” from the Photo Album entirely. The other Sophia photos remain. Exactly one album entry and its capture/upload metadata were removed. No media files were recompressed.

## Apply

1. Extract this ZIP into your repository root, beside index.html. Replace matching files and merge .yearbook when prompted.
2. Delete this now-unused photo file from the repository:

assets/golden-moments/7fc5f6d0f6384b3a94d5b8f304805e6b2d49193b4e0944c692b2bb7b34b109b2.webp

Alternatively, run CLEANUP-PATCH-001.ps1 from the repository root with PowerShell. It verifies that the updated catalogs are in place and that the photo matches the baseline before deleting only that photo. If PowerShell blocks scripts, use the manual deletion above; do not change your security settings.
3. Review changes in GitHub Desktop, commit, then Push origin. The repository root must remain your Pages publishing folder.

The catalog replacements alone remove the photo from the displayed album. The deletion in step 2 also removes the unused image file from the published repository tree; it does not purge previous Git history.

## Validation

- Exactly one catalog photo removed; every other photo record is unchanged.
- Matching capture-date and upload-date records removed.
- No remaining reference to this photo in baseline HTML, CSS, JavaScript, SVG, or JSON after applying the patch.
- Removal target has no other page uses.
- Required base and old/new SHA-256 checksums recorded in .yearbook/patch-001.json.
- Original photo asset size: 152,520 bytes; removing it reduces storage.

The hosted Sites copy and your GitHub deployment are separate. This package updates your GitHub copy when you apply and push it; no GitHub deployment has been performed here.
