# Golden Grain GitHub patch workflow

The complete two-part export delivered November 25, 2026 is baseline-000, designated by Omar as the active GitHub site on November 26. The exact archived files and source provenance are recorded in .yearbook/release.json. This checkpoint adds documentation only and does not change the visible site.

## Standing instructions for future changes

- Every completed website change must include a downloadable numbered patch ZIP, starting with Golden-Grain-Patch-001.zip. Updating the hosted preview alone is not a complete handoff.
- GitHub updates are manual. Never claim a patch is live on GitHub merely because it was generated or the Sites preview was published.
- Recover the exact baseline archives recorded in .yearbook/release.json when necessary. Older exports with similar filenames are not substitutes. Restore subsequent patch releases in order to reconstruct the correct base.
- Compare the final portable static export against the appropriate base by relative path and SHA-256. Include only added or changed files, using their complete replacement contents and original relative paths, including changed media, catalogs, CSS, JavaScript and HTML.
- Each patch must specify its patch number, required base, changes, validation results, and exact paths to remove or rename. Copying a ZIP cannot delete obsolete files: provide an explicit removal list whenever necessary. Do not delete unrelated repository files or .git.
- Include an updated .yearbook/release.json and a per-patch change manifest with old/new file hashes. Record delivered releases separately from confirmed GitHub-applied releases.
- Default to sequential patches based on the previous delivered release and clearly state prerequisites. If earlier patches were skipped, provide a cumulative patch from the last confirmed installed release instead of silently assuming installation.
- Do not resend unchanged media or a full build unless requested. Preserve existing image/video quality, local fonts, relative URLs, static photo/video catalogs, and the 900 MB site budget. Do not reintroduce the uploader or download controls.
- Validate local references and changed functionality before handing over each patch. Preserve the independent static GitHub Pages build; hosting credentials and private endpoints must never enter the patch.

## Apply this checkpoint

Extract Golden-Grain-GitHub-Checkpoint-000.zip into your repository root, alongside index.html. It adds PATCH-WORKFLOW.md and .yearbook/release.json. Commit and push whenever convenient. No website content changes are included.

## Apply future patches

Check the patch's required base, extract its replacement files into the repository root and replace matching files, perform any explicitly listed removals, then review, commit and push in GitHub Desktop. Keep .git intact. Tell the assistant if you skip a patch or edit repository files yourself so later patches can account for that difference.
