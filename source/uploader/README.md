# Golden Grain upload inbox

A standalone passcode-only intake site. No yearbook pages are changed on upload. Original bytes are stored in R2, with names, batches, upload dates and stable SHA-256 image URLs in separate metadata records. No deletion or editing controls.

Runtime secret: UPLOAD_PASSCODE. Never commit its value. R2 binding: BUCKET.

## Retrieve photos for a later yearbook task

Use the user's authorized passcode to POST JSON {passcode} to /api/login with the same-origin Origin header. Keep the returned session cookie private. GET /api/photos returns metadata and an optional cursor; continue with ?cursor=... until null. Download each selected item's src with the same cookie. Match by batch and original filename, then copy selected photos into the yearbook project or its storage using its normal authorized workflow. Do not publish them merely because they were uploaded. POST /api/logout when finished.

The yearbook remains a separate site with unchanged access settings. This site's platform audience is public only so the passcode form can be reached without ChatGPT. All data endpoints and photo downloads require an expiring server-checked session.

Build: npm run build. Tests: npm test. The dev script only previews the locked UI; API tests exercise uploads with an isolated fake bucket.

## Direct yearbook storage
New uploads stream through the authenticated inbox into the yearbook R2 bucket (`photos/` original bytes and `inbox/` metadata). Runtime secrets YEARBOOK_ACCESS_TOKEN and INBOX_SERVICE_KEY authorize fixed server routes; YEARBOOK_ORIGIN is the target site origin. No secrets go to the browser. Files remain unassigned until requested. Their yearbook URL is `/inbox-media/<hash>`. In the uploader this is rewritten to a session-protected `/yearbook-photo/<hash>` proxy. Older local uploads remain accessible through a final legacy page.
For future placement, query `/api/inbox/photos` on the yearbook using its Sites service header and x-inbox-key; alternatively log into the photo inbox and query `/api/photos`. Preserve names/batches. No page edits or catalogue publication happen during upload.
