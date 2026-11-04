# AST Education website

Full-stack project for ALL STUDIES & TECHNICAL EDUCATION (AST Education), Roorkee.

## Structure

```
ast-education/
├── client/                         React + TypeScript + Vite public website
│   ├── public/assets/               Optimised logo and approved certification artwork
│   ├── src/pages/                   Public pages: courses, leadership, gallery, videos, enquiry, etc.
│   ├── src/admin/                   Login, enquiry dashboard and content-management screens
│   ├── src/lib/                     API clients, verified facts, forms and SEO helpers
│   ├── src/styles/                  Public and admin styles
│   └── scripts/                     Approved-markup generator and full-page prerenderer
├── server/                          Express 5 + TypeScript + MongoDB API
│   ├── src/routes/                  Public, enquiry, admin, media, content and video APIs
│   ├── src/models/                  Admin, session, enquiry, content, media, video and audit models
│   ├── src/middleware/              Authentication, rate limits and error handling
│   ├── src/media/                   Image processing, storage and delivery
│   ├── src/scripts/                 Admin creation, content seeding and media cleanup
│   ├── scripts/create-admin.ps1     Secure PowerShell bootstrap for owner/staff accounts
│   └── test/                        API, authorization, media and workflow tests
├── README.md
└── TESTING-REPORT.md
```

## Phase status

- **Phases 1–4:** implementation is present in this source tree: enquiry API/form, admin authentication and enquiry workflow, public pages/content editors, SEO/prerendering, controlled image uploads, permissions and security headers.
- **Phase 5:** YouTube URL-based video management and public video display are implemented. Video-file hosting is intentionally out of scope.
- **Not production-certified:** current code has not completed a fresh dependency-aware typecheck/test/build run in the latest environment, nor live MongoDB/S3/browser/mobile tests or deployment. See `TESTING-REPORT.md` and the launch gates below. “Implemented” does not mean “verified in production.”

## Setup

Requirements: Node.js 20.11 or later, and MongoDB 6 or later (local or MongoDB Atlas).

### Windows PowerShell

Open two PowerShell terminals in the extracted `ast-education` folder.

**Terminal 1 — backend:**

```powershell
cd server
Copy-Item .env.example .env
# Open server/.env and confirm MONGODB_URI and CLIENT_ORIGINS.
npm ci
npm run dev
```

The API should start at `http://localhost:4000`. Keep this terminal open.

**Terminal 2 — frontend:**

```powershell
cd client
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite forwards `/api` requests to the backend on port 4000.

### macOS / Linux

```bash
# Terminal 1
cd server
cp .env.example .env
npm ci
npm run dev

# Terminal 2
cd client
npm ci
npm run dev
```

Do not create a second `.env` with production credentials in the client. The browser must never receive MongoDB or S3 secrets.

## Admin dashboard

Owners and authorised staff sign in at `/admin/login`. The public website exposes this page through an **Owner Sign In** link in the main navigation and footer. There is no public registration: accounts are created on the server with a script.

Create the first owner account only after the backend dependencies are installed, `server/.env` points to the intended MongoDB database, and MongoDB is running.

**Windows PowerShell (recommended):** from the project root, run:

```powershell
.\server\scripts\create-admin.ps1 -Email "director@example.com" -Name "Director Name" -Role owner
```

The script prompts for the password without echoing it, temporarily passes it to the server-side creation command, and clears the environment variable afterwards. Use a unique password of 12 to 72 characters. Do not put the password directly in the command or commit it to a file.

**macOS / Linux:**

```bash
cd server
read -s ADMIN_PASSWORD && export ADMIN_PASSWORD
ADMIN_EMAIL=director@example.com ADMIN_NAME="Director Name" ADMIN_ROLE=owner npm run admin:create
unset ADMIN_PASSWORD
```

For a staff account, use `-Role staff` in PowerShell or `ADMIN_ROLE=staff` on macOS/Linux. The script refuses to overwrite an existing account. There is deliberately no public registration page.

**Security design**

- Passwords are hashed with bcrypt (cost 12). Hashes are never returned by the API.
- Sign-in creates a 32-byte random token, sent in an HTTP-only, SameSite=Strict cookie (Secure in production). Only its SHA-256 hash is stored. Sessions last 8 hours, and MongoDB deletes them automatically.
- Sign-in is rate limited to 5 failed attempts per 15 minutes per IP. An account locks for 15 minutes after 10 consecutive failures. Every failure returns the same message, and unknown emails take the same time to check.
- State-changing admin requests must carry the `X-Admin-Request` header. Cross-site pages cannot add it without a preflight, which the origin allowlist refuses.
- Admin responses send `Cache-Control: no-store`. Every input is validated on the server with strict schemas, search text is regex-escaped, and date filters use India Standard Time.
- Logs record the action and admin ID only, never names, emails, phone numbers or message text.

**Deployment requirement:** the admin site and the API must be on the same site (subdomains are fine, for example `www.example.com` and `api.example.com`), or the API must be proxied under `/api` on the same origin. Because cookies are SameSite=Strict, a cross-site deployment will not sign in.

**Migration:** if Phase 1 test data contains the retired status `closed`, run `db.enquiries.updateMany({ status: 'closed' }, { $set: { status: 'rejected' } })` in the MongoDB shell first.

## Content management (Phase 3)

**Statuses.** Courses, leadership profiles, gallery items and testimonials each have a status: `draft`, `published` or `archived`.

**Verification.** Every record also has a verification state, `pending` or `verified`. The public website shows a record only when it is published and verified. Gallery items also need `permissionConfirmed`, and testimonials need `consentStatus: confirmed`. These rules live in one place: `server/src/routes/public.ts`, and the tests check them.

Business facts (phone, address, hours and so on) follow the same idea. A fact appears publicly only when it is verified and has a value. Google ratings and hours stay pending until someone confirms them.

**Who can verify.** Only the owner can mark something verified. Staff can edit content, but any edit to verified content returns it to pending until the owner verifies it again.

**Admin screens.** Courses, Leadership, Gallery, Testimonials and Business facts appear in the admin navigation. Images are uploaded through the editor (see "Image storage and uploads").

**Seeding.** Run `npm run seed:content` once on the server. It is idempotent: it creates the approved course list, two leadership records awaiting verification, and the business facts with their verification state. It never overwrites existing records.

**Verified facts in the build.** The file `client/src/seo/verified-facts.json` is a snapshot of the verified facts. It is used before the API answers, as a fallback if the API is unreachable, and for structured data. When facts change, update the snapshot and the seed script together.

## Public pages and SEO

- Every public page is prerendered with its full body. `npm run build` in `client/` produces one HTML file per route, so search engines and first visits receive real content without waiting for JavaScript. The browser then attaches to that markup.
- Each page has its own title, description, Open Graph tags, Twitter card and canonical link (canonical links need `SITE_URL`). The home page has organisation structured data built only from verified facts.
- `robots.txt` excludes the admin screens and the API. `sitemap.xml` is written when `SITE_URL` is set. Set it before building, for example `SITE_URL=https://www.example.com npm run build`.
- Home and About use the approved markup, generated from `client/reference/approved-draft.html` by `client/scripts/generate-approved.py`. Do not edit `client/src/content/approved.ts` by hand.
- Build checks fail the build if unverified claims (ratings, hours, invented statistics), the withdrawn wording, or portrait files appear in the output, or if a page lacks its heading, address or hydration script.

### How the public pages show live, loading and fallback data

- **Loading:** the page shows its approved content with a neutral "checking" message. It never claims that data is live.
- **Live:** the server answered, and its list is shown exactly, including an empty list. A list is never replaced by the approved fallback.
- **Fallback:** the server could not be reached. The page shows the approved list or snapshot with a notice that gives the snapshot date and says live data is unavailable. Hours and ratings are never shown from the fallback.

### Portraits and photo permission

Portraits are kept in `server/private-assets/` and are not part of the website files. A portrait is sent to the public only when the profile is published and verified, and the owner has confirmed photo permission. Staff cannot confirm permission. Changing a portrait file name resets its permission. To add a portrait, copy the image into `server/private-assets/` and enter its file name in the leadership editor.

## Cross-origin requests and admin security

- **Origins.** Only the origins listed in `CLIENT_ORIGINS` may call the API from a browser. Each origin must be exact, including the scheme and port.
- **Methods.** `GET`, `POST`, `PATCH` and `DELETE`. `PATCH` is needed for content and business-fact updates. `DELETE` is needed to remove gallery items and unused images.
- **Headers.** `Content-Type`, `X-Admin-Request` and `X-Filename` only. Any other header is not granted in a preflight.
- **Writes.** Every admin write must also carry `X-Admin-Request: 1`, and a signed-in session. A preflight grants no write access by itself. The server still checks both.

## Security headers

`client/public/_headers` sets a Content Security Policy, frame and referrer policies, and `no-store` for admin pages. Hosts that do not read `_headers` files need the same headers in their web server or reverse proxy. The API sends its own headers through helmet.

## Privacy and retention

The Privacy Policy describes what an enquiry stores, why, who can read it, and where it is kept. It states that the retention period is a placeholder, and so are the hosting, encryption and backup details, until the institute confirms them.

## Tests and checks

```bash
cd server && npm run typecheck && npm test && npm run build
cd client && npm run typecheck && npm test && SITE_URL=https://your-domain npm run build
```

`TESTING-REPORT.md` records the results of the most recent full run and what was not tested.

## Manual checklist before launch (needs a live MongoDB and a browser)

1. Run `npm run seed:content`, then sign in and check the public courses page shows the 20 approved courses.
2. Confirm the public address matches the owner-confirmed address on the contact page, the footer and the admin Business facts page.
3. Stop MongoDB, reload a public page, and confirm the fallback notice appears and no live-only data is claimed.
4. As staff, edit a course and confirm it returns to pending and leaves the public site. As owner, verify it again.
5. As staff, try to confirm a portrait permission and confirm it is refused. As owner, confirm it and check the portrait appears.
6. Check every route on a phone-sized and a desktop browser, including the mobile menu, the gallery lightbox (with arrow keys) and the admin screens.
7. Confirm the enquiry form still saves and the admin dashboard still lists it.
8. Upload a JPEG, a PNG and a WebP image; try a GIF and a file renamed to .jpg; confirm the errors are clear.
9. Upload a portrait as staff, confirm it is not visible publicly, then confirm it as owner and check it appears.
10. Replace a gallery photo, confirm the old image is removed from storage, then try to delete an image still in use and confirm it is refused.
11. Check that a bucket object URL opened directly in a browser is refused (the bucket must stay private).
12. Upload a source image at each of these widths: 300, 500, 1200 and 2000 pixels. For each, open every address in the gallery's `srcSet` in a browser and confirm it loads as WebP. Confirm the admin preview shows for the 300 px image.
13. In a browser, delete a gallery item as owner and confirm its image is gone from the public site. Confirm a DELETE from another origin is refused.
14. Withdraw a portrait's photo permission as owner. Reload the leadership page: the portrait must disappear. In browser developer tools, the portrait address must return 404, and a fresh request must show `Cache-Control: private, no-store`.
15. In the browser, confirm a cross-origin admin write from an allowed origin passes the preflight (`PATCH` is allowed), and that a request from any other origin receives no permission.

## Image storage and uploads

Photographs and portraits are stored in an S3-compatible bucket (production) or a private local folder (development). MongoDB stores only metadata and the links between records and images. Image bytes are never stored in MongoDB, and no image is stored inside the public client folder.

### Upload rules and limits

| Rule | Value |
|---|---|
| Accepted types | JPEG, PNG, WebP. The actual file content decides, not the declared type or the file name. GIF, SVG, HTML, executables and damaged files are refused. |
| Maximum upload | 6 MB by default (`MEDIA_MAX_UPLOAD_MB`, up to 10 MB). The browser checks this first; the server enforces it. |
| Maximum dimensions | 6000 pixels on the longest side, and 24 million pixels in total. |
| Upload rate | 60 uploads per 15 minutes per IP address. |
| Output | Optimised WebP variants. The widths are the common sizes 480, 960 and 1600, plus the source width when it falls between them, and never above 1600. Images are never enlarged. Examples: a 300 px source stores [300]; 500 stores [480, 500]; 1200 stores [480, 960, 1200]; 2000 stores [480, 960, 1600]. |
| Storage key | Exactly `media/{storageId}/{width}.webp`. The storage identifier is 32 lowercase hexadecimal characters. The width is a whole number from 1 to 1600 with no sign, decimal point or leading zero. |
| Metadata | Orientation is applied, and all metadata is removed, including camera data and GPS location. |
| Names | Storage keys use random 128-bit identifiers. The original file name is kept only as a sanitised label. Paths and markup are removed from it. |

### Who can do what

| Action | Owner | Staff |
|---|---|---|
| Upload an image, or replace one while editing a record | Yes | Yes |
| Confirm photo permission for a portrait | Yes | No (the control is disabled for staff) |
| Delete a gallery item together with its image | Yes | No |
| Delete an image directly (refused while any record uses it) | Yes | No |

### What a change resets

- **Real changes only.** Saving a record without changing anything has no effect on its verification or permission. The editor sends every field on every save, so the server compares each value with the stored record.
- **Any content change** returns the record to pending until the owner verifies it again.
- **Replacing or removing a portrait** resets its photo permission. The owner may confirm the new portrait in the same save.
- **Replacing a gallery photograph** clears its permission confirmation. Confirm it again after saving.
- **Replacing an image** removes the old image only after the record has saved, and only if no other record uses it.

### Who can see an image

- A gallery photograph is public only when its record is published, verified and permission-confirmed.
- A portrait is public only when its profile is published and verified and the owner has confirmed photo permission.
- Admins can preview any image through an authenticated route, including portraits that are not yet permitted.
- Storage keys and internal identifiers never appear in public responses. Public image addresses use the image identifier and a width, and the server streams the bytes after the checks above.

### Cache policy

| Image | Cache header | Why |
|---|---|---|
| Portrait | `private, no-store` | Permission can be withdrawn at any time. A cached copy would keep showing a withdrawn portrait. |
| Gallery photograph | `private, no-store` | Permission withdrawal takes effect on the next request. |
| Public JSON (courses, leadership, gallery lists) | `public, max-age=60`; gallery list `no-store` | Gallery permission withdrawal takes effect on the next request. |

### Configuration

| Variable | Required | Purpose |
|---|---|---|
| `MEDIA_STORAGE` | Yes | `local` for development and tests, `s3` for production. Production refuses to start with `local`. |
| `MEDIA_LOCAL_DIR` | No | Folder for local images, default `var/media` inside `server/`. Never inside the web root. |
| `MEDIA_MAX_UPLOAD_MB` | No | Upload limit, default 6. Keep it in step with the client limit. |
| `S3_BUCKET`, `S3_REGION` | When `s3` | Bucket name and region. |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | When `s3` | A credential that can read, write, list and delete objects in this bucket only. |
| `S3_ENDPOINT` | Non-AWS | Provider endpoint, for example Cloudflare R2, Backblaze B2 or MinIO. |
| `S3_FORCE_PATH_STYLE` | No | `true` for MinIO and some self-hosted providers. |

Keep the bucket private. Do not enable public read access. The API decides whether an image may be seen.

### Setup

```bash
cd server
cp .env.example .env          # set MONGODB_URI and, for production, the S3 variables
npm install
npm run seed:content          # creates approved records and imports the two approved portraits
npm run dev
```

The portraits in `server/private-assets/` are seed sources only. The seed imports them once. After seeding, keep a secure copy of those files and remove them from the server.

### Reconciliation, backup and recovery

Run the reconciliation report before and after any restore, and on a daily schedule:

```bash
npm run media:cleanup -- --dry-run   # reports only
npm run media:cleanup                # removes what is safe to remove
```

The report covers three things. Each count gives identifiers and numbers only, never storage keys.

1. **Unused images** in the database older than 24 hours. Removed by the second command.
2. **Stored files with no record** older than 24 hours. These are left behind by a failed write. Only files named in the application's own format are considered, so other files in the bucket are never touched.
3. **Images whose stored files are missing.** Records still point at them, so the public site shows no image for them. Re-upload and attach the image in the admin editor.

**Backups.** Back up the database and the image store together, on the same schedule.

- *S3-compatible storage:* enable bucket versioning, keep noncurrent versions for at least 30 days, and replicate the bucket to a second location if your provider supports it.
- *Local storage (development only):* copy `server/var/media` with the same schedule as the database.

**Recovery.**

1. Restore the database from its dump.
2. Restore the image store to the same point. With versioning, restore the versions that match the dump.
3. Run `npm run media:cleanup -- --dry-run`. Note any missing images.
4. Re-upload each missing image in the admin editor. A portrait returns to pending permission, so the owner must confirm it again.
5. Run `npm run media:cleanup` to remove unreferenced files.
6. Check a public gallery page and the leadership page in a browser.

An image that was never saved is not public, because nothing references it. The cleanup removes it after 24 hours.

### Redesign handover

The redesign can change presentation without touching data or rules:

- Visual tokens (colours, spacing, type) live in `client/src/styles/site.css` and `admin.css`.
- Public screens are in `client/src/pages/`. Each reads through one data hook, and each already handles loading, live and fallback states.
- The public API responses in `server/src/routes/public.ts` are the contract. Keep their shape or version them.
- Visibility and cache rules are in `server/src/visibility.ts`. Do not move them into the interface.
- Image sizes come from the `srcSet` values the API returns, which list every width that was stored. A new layout can add sizes by changing `RESPONSIVE_TARGETS` in `server/src/media/format.ts`. Stored widths for existing images do not change unless the image is re-uploaded.

## Production

- **API:** run `npm run build && npm start` in `server/` with real environment variables. Serve it over HTTPS behind a reverse proxy (nginx or a managed platform), and set `TRUST_PROXY` to the number of proxies so rate limits use the real client IP.
- **Frontend:** run `npm run build` in `client/` and host `client/dist` on a static host. Configure the host to serve `index.html` for unknown paths so deep links work, and set `CLIENT_ORIGINS` on the API to the frontend's exact origin.
- **Database:** use MongoDB Atlas with a dedicated user, network allowlisting, encryption at rest and automated backups. Never commit `.env`.
- **Headers:** helmet sets API security headers. Add a Content-Security-Policy and HSTS at the static host or proxy for the frontend.

## Data handling

- Enquiries store only the fields the student submits, plus the time consent was given. The client IP is not stored.
- Internal notes are excluded from default queries.
- Retention period: **placeholder, to be confirmed by the institute** before publication. No automatic deletion is configured yet.
- The Privacy Policy states that enquiries are stored. Its retention, hosting and backup details remain placeholders until the institute confirms them.

## Known limitations

- **Permission controls are checked in tests, not live.** The owner-only rules and the public-visibility guards are tested with pure functions and static checks. Their behaviour against a live database still needs the manual checklist.
- **Gallery permission is owner-only** in the current revision. Staff may edit gallery content, but cannot confirm permission to publish it. Replacing a photo clears the confirmation.
- **No browser or end-to-end tests yet.** Automated tests cover rules, validation, routes, the build output and the state model. Hydration and layouts still need a browser check (see the manual checklist).
- **Existing records are not updated by the seed.** The seed never overwrites records. If you ran an earlier seed, re-verify the address and other facts in the admin Business facts page.
- **The course fallback cannot know about later archive decisions.** It shows the approved list with its date and a notice, so visitors know to confirm before enrolling.
- **S3 adapter is not tested against a live provider.** It uses the standard AWS SDK and is type-checked, but the upload, read and delete paths have not been run against a real bucket. Run the checklist below against your chosen provider before launch.
- **Image processing needs a supported platform.** The image library ships prebuilt binaries for common Linux, macOS and Windows targets. Build on the same platform you deploy to.
- **No virus scanning.** Uploads are checked by content and fully decoded, which blocks non-image payloads, but malware scanning would need a separate service.
- **No CDN in front of the API.** Images are delivered through the API with cache headers. Add a CDN if traffic grows.
- **The original 2 MB logo PNG is retained as source artwork.** The public website uses the optimised WebP derivative; regenerate it only from the approved original.
- **Verified facts appear in three places.** The seed data, the client snapshot and the approved markup. A test checks that the seed and snapshot agree, but the approved markup must be kept in step by hand.
- **Owner confirmation is not document verification.** Facts marked owner-confirmed were confirmed by the owner and have not been checked against an independent document.
- **Retention period, hosting, encryption and backup details** are placeholders in the Privacy Policy until the institute confirms them.
- **No deployment has been done.** Production launch waits for your approval.

## Operations (backups and monitoring)

See also "Backups for images" above.

- **Backups:** schedule a daily `mongodump` of the production database, keep at least 14 daily copies, and test a restore once a quarter. Store copies outside the application host.
- **Monitoring:** poll `/api/health` from an uptime monitor. Logs record actions and error types only, never names, phone numbers or messages, so they are safe to retain.
- **Secrets:** keep `server/.env` out of version control. Rotate the database password if it is ever exposed.


## Phase 5: YouTube video management

**Video upload scope:** direct MP4/MOV/WebM file upload and video-file hosting are intentionally not part of this website. Admins add a YouTube URL and manage its title, category, consent, publication and featured status. Image uploads remain available for the gallery and approved portraits.


- Admin navigation includes **Videos**. Staff can add and edit draft records; only the owner can publish, archive, feature, confirm/withdraw consent, or permanently delete.
- The institute uploads the actual video to its YouTube channel. The AST database stores only the YouTube video ID, source URL and approved metadata; there is no video file hosting, YouTube Data API key or extra video-hosting charge.
- Accepted links are standard YouTube watch, short, Shorts and embed URLs. The server extracts the 11-character ID and constructs the privacy-enhanced `youtube-nocookie.com` embed URL. Arbitrary iframe URLs are never accepted.
- Public pages show only published videos with confirmed consent. Minor participants also require documented parent/guardian consent. Withdrawing consent unpublishes the video and removes it from the public API; the video endpoint is `no-store`.
- The homepage displays the single featured video; `/videos` provides category filters. Players load only after the visitor clicks the thumbnail.
- **Important:** YouTube Unlisted is not private. Anyone with the link can view and share it. Confirm permission from every identifiable participant before publishing; obtain parent/guardian permission for minors. YouTube branding, platform policies and possible platform-side recommendations remain outside AST's control.

### Phase 5 manual checks still required

1. Sign in as staff: add a draft; verify publish, feature, consent confirmation, archive and delete actions are unavailable and API requests are refused.
2. Sign in as owner: confirm documented consent; for a minor also confirm guardian consent; publish and feature one video.
3. Confirm only the approved featured video appears on the home page and `/videos`; check category filters and click-to-play on mobile and desktop.
4. Withdraw consent and verify the video disappears from the public API on the next request.
5. Try invalid and hostile YouTube URLs; verify they are rejected. Confirm an edited YouTube URL resets consent and returns the record to draft.
6. Test with a real MongoDB and browser before launch. These checks have not been run in this isolated environment.


## Production readiness follow-up (2026-11-04)

- The public video page now distinguishes loading, empty and failed API states; the empty-publication message is shown only after a successful empty response.
- Contact links in the approved Home/About markup, the enquiry error state and the pre-filled WhatsApp message now use the verified business facts supplied by the public facts API (with the approved snapshot as fallback).
- The logo is served as a compact WebP asset (the original PNG is retained as the source artwork). The generated approved markup references the WebP asset.
- Administrative activity is now persisted in the MongoDB `AuditEvent` collection. Events contain action metadata and administrator IDs only; they must not contain enquiry contents or contact details. Ensure MongoDB backups include this collection and establish an institute-approved retention period.
- The Privacy Policy now explains the data collected and explicitly identifies production provider/security details and a specific retention schedule as items that must be confirmed before live enquiry collection. These operational facts cannot be safely invented in code. The Terms page has been expanded but still requires institute/legal review.

### Remaining launch gates (external configuration or real-environment tests)

1. Confirm the production MongoDB host, encryption configuration, backup provider, restore procedure and enquiry retention/deletion period; then update the Privacy Policy.
2. Install locked dependencies in a network-enabled environment and run the full server/client typechecks, tests and production builds.
3. Test MongoDB CRUD, seeding, session revocation, audit-event persistence and media reference cleanup against a real staging database.
4. Test S3-compatible upload, delivery, listing and deletion with production-like credentials.
5. Run real browser tests on mobile/tablet/desktop for navigation, forms, gallery, video embeds, admin screens, consent withdrawal and cache headers.
6. Configure a shared rate-limit store for horizontally scaled production deployments, central log retention/alerting, CDN, backups and uptime monitoring.
7. When verified business facts change, update `client/src/seo/verified-facts.json` and run a new static build/deployment so prerendered structured data, canonical URLs and sitemap stay current. Set `SITE_URL` in the build environment.
8. Measure Core Web Vitals on the deployed site and confirm the deployed image-processing binaries work on the chosen runtime.

Deployment remains untouched pending the owner's explicit approval.
