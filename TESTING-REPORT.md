# Testing report: Phase 4, verified revision

## Environment

Node.js 22 in an isolated container. Every run used a clean copy of the project with fresh dependency installs.

**Not available in this environment:** a MongoDB server, an S3-compatible storage provider, and a browser.
Nothing in this report describes a live database, live storage or browser test as passed. Those checks are listed
under "Not tested" and are required before launch.

## Commands and results

| Area | Command | Result |
|---|---|---|
| Server | `npm install` (clean copy) | Passed |
| Server | `npm run typecheck` | Passed |
| Server | `npm test`: nine suites, listed below | Passed, all nine |
| Server | `npm run build` | Passed |
| Client | `npm install` (clean copy) | Passed |
| Client | `npm run typecheck` | Passed |
| Client | `npm test`: three suites, listed below | Passed, all three |
| Client | `npm run build` with `SITE_URL`: browser bundle, server render, full-page prerender, safety checks | Passed: 11 pages |
| Client | `npm run build` without `SITE_URL` | Passed; canonical links and sitemap skipped with a warning |
| Output | Scan of the public build for storage paths, portrait file names and storage identifiers | None found |

Server suites: enquiry, admin, content, publication, media, widths, CORS, authorization, and processing-to-delivery flow.
Client suites: data state, component render, upload state.

## Defects fixed in this revision

### 1. Image widths the storage could not hold (critical)

The pipeline could produce any width from 1 to 1600 (for example 300, 500 or 1200 pixels), but the storage key pattern
and `parseWidth()` accepted only 480, 960 and 1600. A source image that produced a width such as 300 would be processed,
and then rejected when it was stored.

Changes:
- Stored widths are any whole number from 1 to 1600. The source width caps the largest variant, so nothing is enlarged.
- `plannedWidths()` is the single rule for which widths to store. The pipeline stores exactly those widths, and fails
  loudly if a resize does not return the planned width.
- Storage keys are exactly `media/{storageId}/{width}.webp`. The storage identifier must be 32 lowercase hexadecimal
  characters. The width must be a whole number from 1 to 1600, with no sign, decimal point or leading zero.
- `parseWidth()` accepts only canonical decimal text inside the range.
- Public `srcSet` lists every stored width, and `src` is the largest. The public media route serves any stored width.

### 2. Admin preview assumed a 480 px variant (found while fixing item 1)

The uploader's preview requested `/480`. An image whose smallest variant is 300 pixels would show a broken preview.
The preview now uses `GET /api/admin/media/{id}/preview`, which serves the largest variant at or below 480 pixels, or
the smallest available. The route is registered before the width route, so `preview` is never read as a width.

### 3. CORS did not allow DELETE (critical)

DELETE is now an allowed method. The origin allowlist, the allowed headers, and the `X-Admin-Request` check are unchanged.

## Requirements: implementation and evidence

| Requirement | Implementation | Evidence |
|---|---|---|
| Allow safe numeric widths from 1 to 1600 | Width rule in `format.ts` | Widths suite: accepted and refused values; flow suite |
| Storage identifier strictly 32 lowercase hex | `variantKey()`, `isStorageKey()` | Widths suite: refused identifiers, uppercase, wrong length, traversal |
| Key structure exactly `media/{storageId}/{width}.webp` | Single key builder and pattern | Widths suite; flow suite stores and reads back every key |
| Reject zero, negative, decimal, non-numeric, oversized and traversal widths | `parseWidth()`, key pattern | Widths suite (request widths and key widths); flow suite (HTTP 404 for each) |
| `parseWidth()` accepts only valid generated widths | Canonical pattern and range check | Widths suite; flow suite requests unstored widths and gets 404 |
| `srcSet` and delivery work for every stored variant | `responsiveImage()` builds from stored widths | Flow suite: for source widths 300, 500, 1200 and 2000, each `srcSet` address returns the stored bytes as WebP |
| Never upscale | Planned widths never exceed the source | Widths suite: every source from 1 to 6000; flow suite: stored width equals key width and never exceeds the source |
| Test the complete processing-to-storage-key flow for 300, 500, 1200 and 2000 | Flow suite | Flow suite: processing, key construction, real local storage read-back, HTTP gallery response, and every public address |
| DELETE preflight from an allowed origin succeeds | CORS allowlist includes DELETE | CORS suite |
| DELETE preflight from an unapproved origin gets no permission | Origin allowlist unchanged | CORS suite |
| DELETE without `X-Admin-Request` is rejected | Header guard runs before routes | CORS suite (403) |
| DELETE without a valid session is rejected | Session guard runs before any lookup | CORS suite (401 with no cookie and with a malformed cookie) |

## What the flow suite covers, and what it does not

The flow suite runs the real image processing, the real storage keys, the real local storage, and the real HTTP server.
It replaces only the database layer, with in-memory stand-ins for four model functions. Because of that:

- It proves that every planned variant is stored, read back, listed in `srcSet`, and served at its public address.
- It does not prove that MongoDB stores or returns these records. That is covered only by the manual checklist.
- A well-formed session token that is not in the database needs the database to reject it. The suite therefore tests
  only the malformed-token case.

## Mutation checks

Each defect was reintroduced in a scratch copy, one at a time. The matching suite failed each time.

| Reintroduced defect | Suite that failed |
|---|---|
| Storage keys and `parseWidth()` restricted to 480, 960 and 1600 | Flow and widths |
| DELETE removed from CORS methods | CORS |
| Upscaling allowed (cap removed) | Widths |
| Earlier checks: PATCH removed from CORS; portraits cached for a day; every save counted as an edit; staff save of unchanged confirmed profile refused; known files treated as orphans; owner guard disabled; public visibility check disabled; delete-while-in-use check disabled | CORS; media; publication; authorization (each in the earlier revision) |

With each defect removed again, the full suite passed.

## Corrections made to my own tests during this revision

Three of my test expectations were wrong, and the code was correct:
- The preview expectation for `[1, 2, 3]` assumed no width fits under 480. All three do, so the largest (3) is correct.
- The check that public responses contain no storage key was too broad: public addresses contain the word `media/`.
  It now checks for the exact key shape.
- The first run of the width suite used a wrong working directory for a copy. The copy was repeated with absolute paths.

## Not tested (required before launch)

- **MongoDB.** Creating, attaching, replacing and deleting images against real records; public visibility queries;
  the reconciliation report against real data; seeding; and the cleanup script. The cleanup and seed scripts are
  type-checked only.
- **S3-compatible storage.** Upload, public delivery, listing and deletion against a real bucket. The adapter is
  type-checked and reviewed, and the local adapter passes its tests, but the S3 adapter has not been run live.
- **Browser.** The admin upload screen (progress, rejected files, keyboard use); the public gallery and srcSet loading
  in a real browser; the portrait withdrawal and cache headers as a browser sees them; and CORS preflights from a
  real browser.
- **Layouts and hydration** on phones, tablets and desktops, and the gallery lightbox.
- **Image processing** on the platforms you deploy to. The image library's binaries were verified only on this container.
- **Deployment, restore and monitoring.** Deliberately not done. Deployment waits for your approval.

## Decisions still open

- **Gallery permission** is confirmed by any admin, while portrait permission is owner-only. Decide whether gallery
  permission should be owner-only too.
- **Gallery cache** lets a withdrawn photograph remain visible for up to five minutes. Use `no-store` if immediate
  withdrawal is required.


## Phase 5 implementation note (2026-11-04)

The current working revision adds YouTube video management, public video display, a featured homepage video, owner-only gallery publication permission, and no-store caching for permission-bearing gallery media. It also adds URL-validation tests and gallery authorization assertions.

**These Phase 5 changes are not yet verified by a full test run.** An attempt to install the locked dependencies in this environment timed out because npm registry requests failed with `EAI_AGAIN` (DNS/network unavailable). The available global TypeScript compiler successfully transpiled all 79 TypeScript/TSX source and test files with zero syntax diagnostics, and the changed JSON files parsed successfully. This is a syntax check only, not a TypeScript typecheck or test run.

Still required before launch: install dependencies with `npm ci` in a network-enabled environment, run the full server and client typechecks/tests/builds, then test owner/staff permissions and consent withdrawal against MongoDB in a real browser on desktop and mobile. Deployment remains intentionally untouched.

## Post-audit remediation (2026-11-04)

Applied in the follow-up source revision:

- Public videos now have an explicit loading state. The publication-empty state appears only after a successful empty API response; API failures are announced separately.
- Home/About telephone and WhatsApp destinations, enquiry-page WhatsApp actions, and the pre-filled WhatsApp follow-up now use verified business facts instead of duplicated contact constants. A missing live fact suppresses its action rather than showing stale fallback data.
- The 2.1 MB PNG logo is retained as source artwork and the site now serves a 163 KB WebP derivative.
- Administrative activity is persisted in MongoDB `AuditEvent` records instead of console-only JSON logs. Event metadata is limited to action/record identifiers and changed field names; enquiry contents and contact details are not included.
- Privacy and Terms pages have been clarified. The Privacy Policy still requires institute confirmation of the production database provider/security configuration and a concrete retention/deletion schedule; those details have not been invented. Terms still require institute/legal review.
- Client render tests now cover live contact-fact substitution in approved markup and the initial video loading state.

Validation in this environment:

- TypeScript transpilation/syntax check: 85 `.ts`/`.tsx` files, zero syntax diagnostics.
- Approved-markup generator: ran successfully.
- Python generator syntax and verified-facts JSON parsing: passed.
- Full TypeScript typechecks and automated test suites: **not run** because `node_modules` are absent and dependencies could not be installed in this offline environment. A direct `tsc --noEmit` attempt reports missing external modules/types, so it is not evidence of a project type failure or pass.
- MongoDB/S3/browser/mobile/production deployment tests remain external launch gates, as listed in README.

## Follow-up verification and scope cleanup (2026-11-04)

- Removed a duplicated **Confirm guardian consent** action from the admin video list.
- Documented explicitly that video-file uploads (MP4/MOV/WebM) are out of scope; video entries use validated YouTube URLs. Image uploads for gallery/portraits remain supported.
- Re-ran the approved-content generator and Python syntax check successfully.
- Re-transpiled all 85 TypeScript/TSX source and test files with the globally available TypeScript compiler: zero syntax diagnostics. This is not a substitute for dependency-aware typechecking or test execution.
- Scanned client/server source for video MIME upload handlers and binary video-upload endpoints: none found. The admin UI contains only an instruction to upload videos to the institute's YouTube channel and paste the URL.
- Confirmed the admin video list contains one guardian-consent action.
- Attempted `npm ci --offline` for the server. It could not run because the required locked `zod` package is not present in the local npm cache. No full typecheck, automated suite or production build was claimed from this attempt.

The launch gates in the README remain real requirements: institute-approved privacy/retention details, live MongoDB and S3 configuration/tests, browser/mobile end-to-end checks, and deployment/backup/monitoring setup. The source ZIP alone cannot complete or validate those external services.

## Local review follow-up (2026-11-04)

- Confirmed the admin login UI, server-side authentication, owner/staff roles, secure session cookie, login throttling, enquiry dashboard, and server-only account creation flow already exist. No duplicate login implementation was added.
- Added `server/scripts/create-admin.ps1` so a Windows owner can create the first owner account or a staff account using a hidden PowerShell password prompt. Updated the README with Windows and macOS/Linux setup instructions and an accurate project structure.
- Re-ran the approved-markup generator successfully.
- Python generator syntax check: passed.
- JSON parsing for both package manifests/lockfiles and SEO route/fact files: passed.
- TypeScript/TSX syntax transpilation: 84 files, zero syntax diagnostics. This is not a dependency-aware typecheck.
- ZIP integrity check: passed. No `.env` file or `node_modules` directory is included.
- Attempted `npm ci` for the server; it timed out in this environment. Therefore dependency-aware typechecks, automated tests and production builds were not run in this follow-up. PowerShell is not installed in this environment, so the new `.ps1` helper has not been executed here.

Still cannot be completed from source code alone: create the actual owner account against the user's live MongoDB, confirm the institute's enquiry retention/privacy details, configure production MongoDB and private S3-compatible storage, run real browser/mobile tests, and deploy after the owner provides/approves the domain and hosting accounts.
