# EN Nursing Job Tracker

GitHub Pages dashboard for the EN job search, prioritising Midland/Ellenbrook and strong first-EN / theatre-pathway opportunities. Aged care is excluded.

## Structure
- `index.html` – lightweight page structure only.
- `styles.css` – responsive dashboard styling.
- `app.js` – filtering, search, Fit score, quick views, closing-date logic, exports and browser status controls.
- `jobs.json` – master job data. Daily job-search updates should normally change **this file only**.
- `.nojekyll` – keeps GitHub Pages simple/static.

## Dashboard
The main table intentionally stays compact. It shows the fields needed to decide whether a job is worth opening:
- Fit score / published rank
- Role + Area + Type
- Location
- Employment
- Chance
- Theatre relevance
- Pay
- Closing status
- Status + listing link

Listed date, date added, source, full closing date, requirement flags and status buttons sit under **More details + status** inside each role.

Quick views include New Today, Best Fits, Hospital, Graduate, Theatre Pathway, Midland/East, Closing Soon and Stretch Roles. Detailed filters remain available under **Filters & sorting**.

## Fit score
The dashboard calculates a decision score using the established priority order:
- 45% likelihood of landing the first EN role
- 30% theatre/perioperative relevance
- 15% location
- 10% pay

This score is a sorting aid, not a replacement for checking the published requirements.

## Status behaviour
Published status in `jobs.json` is the cross-device source of truth when ChatGPT is told that a role was Applied / Disregarded / Considering / Closed.

Buttons clicked directly on the GitHub Pages dashboard are stored in that browser's `localStorage`. They survive normal `jobs.json` refreshes but do not automatically sync to another device.

## Daily update rules
- Update job data rather than rewriting dashboard code.
- Preserve existing rows and user-set statuses.
- Keep closed roles in history rather than silently deleting them.
- `🆕 NEW` only applies when `new_date` equals the current Australia/Perth calendar date.
- Prefer direct employer/careers links; use aggregator links only when necessary.
- Record listed date, date added, closing date, pay, source and link where available.
- Verify listings before adding or materially updating them.
- Exclude aged care.

## Exports
- **Download Excel** exports the full master tracker.
- **Download visible** exports the currently filtered/sorted rows.

## GitHub Pages
Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`.

Expected address:
`https://llyric-sy.github.io/en-nursing-job-tracker/`
