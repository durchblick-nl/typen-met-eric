# Local personal error practice

Date: 2026-10-18. User-authorized optional practice and accurate public storage explanation, for NL/BE/DE/CH.

## Selection and teaching

`personalPractice.ts` selects at most three keys with recorded errors, ordered by historical error ratio, then error count. This is a transparent task-selection heuristic, not a mastery diagnosis; even a small sample can be offered for voluntary practice. Accept only finite integer counters with valid attempt/error relationships and a physical mapping in the selected course. Restrict to cumulative introduced keys through the first unmastered lesson, including its keys; do not skip saved-progress gaps.

Create three short tasks with the authored word/drill bank already used for curriculum retrieval. Use only introduced characters, rotate combinations, include each focus key in each task. Show the chosen keys before starting, no time limit, stable targets, existing finger/Shift guidance and pause. A round freezes its selection and historical baseline. A later round reselects from the current local counters.

## State and privacy

Reuse `keyStats` inside the existing regional progress store. No new persistence schema or storage key. Persist aggregate attempts/errors per EXPECTED character when each task is complete; do not store actual wrong input sequences, complete text or a generated-exercise history. The in-memory typing store still handles active input normally. Abandoned incomplete tasks are not added, and the round itself is not resumable after reload. An idempotence ref prevents saving a completed task twice; a separate advance guard prevents double next actions.

Only `recordPractice()` is called, never lesson completion or reward actions. Stars, current lesson and game records stay unchanged. Results compare historical and current-round ratios and show sample sizes. Do not claim that a short better score demonstrates durable learning. All calculations and task generation occur on the device, without a provider/API request or analytics event.

The `/privacy` explanation now explicitly names localStorage, the counters stored, per-course rather than per-person separation, shared-browser access, lack of device/browser sync, clearing browser data, private-mode limitations, no analytics consent requirement and no transmission of these counters to OpenPanel. Existing consent-based page analytics and technical connection disclosures remain. The About page and error-bearing lesson results link to `/oefenen#persoonlijk`; the fragment contains no personal input and analytics strips fragments.

## Inspiration and limits

Typewriter's public manual describes deriving practice from error characters and words at reached course levels. This inspires the optional local selection; it does not transfer Typewriter's evidence or accuracy definition to Lettoria. https://www.typewriter.at/de-handbuch/

Calli Clever's provider information highlights breaks and support for children/adults. We use natural stopping points and clear guidance; we do not interpret marketing statements as causal evidence or copy texts, exercises, characters or competitive collection mechanics. https://www.tipptrainer-fuer-kinder.de/info

Historical counters contain no per-key recency, finger verification or character-pair history. Date-based scheduling, transfer tests, accounts, profiles and cloud sync are outside this change. No claim of legal certification or measured learning efficacy.

## Final local validation

- All 34 core tests, explicit TypeScript checking and the complete four-course export passed after the uppercase/finale additions. The final export audit checked 148 core pages/assets and 688 literal translation calls with no missing German translations.
- Isolated Chrome profiles with Playwright (Browser plugin unavailable): empty data, seeded regional/uppercase errors, consent rejection, wrong input retaining the target, ignored repeat, pause/resume, all three tasks, exact once-only counter updates, historical/current sample sizes, retry/exit/focus return, abandoned task, reload, privacy link and About-page entry passed in NL/BE/DE/CH. Stars/current lesson/game records stayed unchanged; persisted state contained neither full text nor actual-input arrays. No OpenPanel requests were loaded without consent.
- Rendered result layouts checked at 1024×768 and 390×844, including screenshots, with no horizontal overflow. The final runs recorded console errors, page errors and failing asset responses; none remained. Temporary scripts and screenshots are outside the repository.
- Broader final flows also passed for all four courses: actual lessons, both Shift hands, DE/CH capitals, the complete final story, exact per-character totals, results/save/reload and uppercase guidance in both bonus games. Existing full bonus pause/end/retry/exit flows passed again.
- Real regional OS/hardware input, Safari, actual browser zoom, child testing and pedagogical efficacy remain unverified. Standalone lint is still unconfigured. No commit, push or deployment performed for these changes.
