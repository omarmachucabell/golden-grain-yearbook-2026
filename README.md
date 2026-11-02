# Golden Grain Raceway — 2026 Yearbook

A static, mobile-friendly yearbook for GitHub Pages. No installation, build, server, API key, Google sign-in, or ChatGPT sign-in is required for the site itself. Embedded YouTube videos still depend on YouTube.

## Publish with GitHub Pages

1. Create a public GitHub repository (for example, golden-grain-yearbook).
2. Extract the downloaded ZIP on your computer.
3. Upload the extracted files and the assets folder to the repository, preserving their folder structure. index.html must be at the repository root, alongside visual.css and visual.js. Do not upload only the ZIP or put everything inside an extra folder.
4. Commit the uploaded files to the main branch.
5. Open Settings → Pages. Under Build and deployment, select Deploy from a branch, choose main and /(root), then Save.
6. Wait for deployment to finish. GitHub shows the live URL on the Pages settings screen. Visitors can open the published website without signing into Google or ChatGPT.

The .nojekyll file disables Jekyll processing. If your file picker hides it, create an empty file named .nojekyll at the repository root using GitHub's Add file → Create new file.

Official setup guide: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Edit the site

- index.html: homepage cover, three-section carousel, expandable team shoutout.
- team.html: 46 individual team cards, including placeholders for missing portraits.
- superlatives.html, spotlight.html: additional Team pages.
- moments.html, vips.html: Golden Moments pages.
- halloween.html, dia.html, dogs.html: Holidays pages.
- holidays.html: compatibility redirect to Halloween.
- visual.css: shared appearance, responsive layout, layered homepage scrolling.
- visual.js: dropdowns, photograph viewer, carousel, and scroll effects.
- assets/: included photos and artwork. Keep this folder and its subfolders intact.

All internal links and image paths are relative, so this works under a GitHub project repository URL. Edit a page and commit the change to update the published website.

## Replacing a portrait placeholder

Upload the photo to assets/, then locate the person's figure in team.html. Replace its portrait-placeholder div with this structure, changing the filename and name:

```html
<button class="photo" data-photo="assets/person.webp" aria-label="Open photograph: Full Name">
  <img src="assets/person.webp" alt="Full Name" loading="lazy">
</button>
```

Keep the existing figcaption beneath it. Photos already present remain included; missing photos remain clearly marked placeholders. Content and recognition markers reflect this supplied edition, not automatic updates from the original Google Site.
