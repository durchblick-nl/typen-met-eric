# Research-informed practice sequence

Date: 2026-10-18. Implements the user-approved mixed approach for NL QWERTY, BE AZERTY, DE QWERTZ and CH QWERTZ.

## Evidence and decisions

- Schüler & Lindauer (eds., 2025), *Didaktik des Tastaturschreibens*, pp. 117–120, discusses row, finger, frequency and alphabetic principles and mixed approaches. It does not establish a universally superior ordering. Some traditional movement-difficulty assumptions derive from typewriters. https://doi.org/10.46586/SLLD.452
- Gahshan & Weintraub (online 2024, volume 2025), WoTIP, studied a combined typing/word-processing intervention with 51 children aged 9–10. It informs gradual instruction and accuracy-oriented practice, without validating Lettoria, its layouts or exact thresholds. https://link.springer.com/article/10.1007/s11145-024-10613-9
- Baddeley & Longman (1978) supports distributing typing training in adults. This does not establish an optimal session length for children. https://doi.org/10.1080/00140137808931764

Our implementation is a design informed by these sources, not a replication or validated intervention. It does not claim that stories, music or hemisphere activation cause improved typing.

## Implementation

Keep all 26 lesson IDs, their existing key introductions and regional finger mappings. Keep authored exercises and meaningful regional words. Add two short entry tasks when a lesson introduces keys: a movement task and a combination task. Display their purpose in the lesson intro and above the active typing area. A space introduction practices actual spaces between f and j.

For each introduction, append a retrieval task in lessons 2, 5 and 9 positions later, clamping to the last lesson and removing duplicate destinations. Current introductions all leave enough later lessons for three distinct visits. This is an explicit editorial scheduling choice, not a research-derived optimum. It spaces practice across lesson positions; it neither measures nor guarantees elapsed days. Later visits rotate word choices or drill combinations. Existing application exercises remain available.

`practiceSequence.ts` uses a small authored Dutch/German word bank, filtered against cumulatively taught characters. Real words are never respelled to fit a layout. Where words are not yet available, or for digits/punctuation, an explicit f/j combination practices the target. Swiss text uses ss. Rare letters including q/x/y and German ß now have three required later retrieval opportunities rather than relying on optional games. Added tasks are short, but total lesson length still differs between courses.

Each character is validated against learned keys and physical mappings in the core suite. `npm run audit:curriculum` prints actual character opportunities, introduction IDs and review lesson IDs for each course; these are technical exposure counts, not learning outcomes.

## Public explanation

Home links to `/over#leren` in every course. The About page explains the approach, parent guidance, study sources, the distinction between research inspiration and tested efficacy, and that ordering, intervals and star thresholds are design choices. Remove the unsupported completion-time guarantee and categorical efficacy slogan in that page. Keep audio optional and avoid mandatory keyboard covers.

## Compatibility and limits

No save-schema migration, storage-key change, revocation of earned stars or new mastery gate. Existing lowercase introduction order is preserved; the subsequently requested uppercase extension below adds case practice within existing lesson IDs. Newly added exercises contribute to the existing cumulative accuracy calculation on future attempts. Previously earned best results remain. Existing optional error warmups remain; this change does not implement date-based review scheduling, adaptive weak-key selection, independent retention assessment or automatic finger verification. Course completion remains distinct from demonstrated lasting mastery.

Real keyboard, Safari and child-user/learning evaluation remain separate evidence. Do not describe passing automated coverage or browser tests as proof of pedagogical efficacy.

## Local validation

- All 30 core tests passed, including learned-character/physical-key coverage for all 104 lessons and three distinct later retrieval lessons per introduced key. Explicit TypeScript checking and the combined four-course production export passed.
- Reproducible audit: NL 5,256, BE 7,373, DE 3,425 and CH 3,380 mandatory character opportunities per complete pass. These are exposure counts, not measured practice time or mastery. Every introduced key has three explicitly assigned later review lessons.
- Export audit: 148 core HTML pages and referenced assets, 652 literal translation calls, no missing German entries. About-page content and its three source links additionally checked in all four exports.
- Browser plugin unavailable; Playwright used isolated Chrome profiles. Home → methodology anchor → responsive explanation (1024×768 and 390×844) passed in all four courses. Actual later lessons completed through movement/mixing/practice/retrieval, with one wrong input, regional Unicode, result, saved mastery and reload. German ß retrieval included “groß”. Existing saved lesson mastery remained intact. No runtime or asset failures in these runs. Screenshots checked visually and kept outside the repository.
- Regression browser flows also passed for all four courses: initial lesson with an inaccurate input → three stars → arcade → ignored arrows/correct character/idle waiting → pause/resume → natural round end/retry/exit → Magievlucht completion → reload. Regional space, BE Shift-digit, DE ß and CH ü targets still work. No final runtime or asset failures.
- Standalone lint remains unconfigured. No Safari, real regional hardware-keyboard test, browser-zoom study, child-user study or production deployment is claimed.


## Subsequent user requests: uppercase practice and a complete final story

The user explicitly requested uppercase instruction and a full Eric story containing all letters and digits. `uppercasePractice.ts` now uses existing consolidation IDs 19 and 20 for opposite-hand Shift on right/left letter keys, and ID 21 for names/sentence beginnings plus Ä/Ö/Ü in DE/CH. No additional lesson IDs, changed storage keys or retrospective loss of stars. Existing lesson 22 practices authored sentences. All A–Z are introduced and exercised explicitly. Capital sharp S is not introduced; German ß and Swiss ss remain correct.

For Swiss German Ä/Ö/Ü, `keyGuidance()` specifies Caps Lock rather than Shift. Microsoft's official Swiss German layout shows capital umlauts under Caps Lock and French accents under Shift: https://learn.microsoft.com/en-us/globalization/keyboards/kbdsg.html . The virtual keyboard and both bonus-game guides explain this sequence. ASCII capitals continue to use the opposite Shift hand. Browser events cannot prove actual finger use, the held modifier, or OS layout configuration.

Late introductions have three distinct retrieval destinations: use the existing 2/5/9 lesson offsets and, where clamping would collapse visits, fill remaining available later lesson positions from the end. These remain editorial lesson-spacing choices, not validated elapsed-day intervals.

`finalStory.ts` supplies an authored continuous story in Dutch or German, with Swiss spelling. The final lesson first retrieves its scheduled keys, then ends with every story paragraph in order. It includes all Latin letters (case-insensitive coverage), 0–9, DE/CH umlauts and DE ß, proper names and sentence capitals. Existing stars require the full sequence. Paragraphs stay below 100 characters. This is cumulative application, not an independent retention study. The title and introduction explain the finale; the original lesson ID and earned best results remain intact.

Earlier local-validation counts above describe the pre-uppercase snapshot. Re-run the audit for current counts. Optional personal error practice is documented in `2026-10-18-personal-practice.md`.

## Final acceptance after uppercase and finale additions

- 34 core tests, explicit type checking and the complete four-course production build passed. Current mandatory character opportunities per full pass: NL 5,452; BE 6,882; DE 4,635; CH 4,603. Every introduced character, including uppercase, has three explicitly assigned later retrieval lessons. These counts do not establish learning time or mastery.
- Chrome/Playwright in isolated profiles: in all four courses both Shift-hand introductions and DE/CH uppercase-umlaut introduction were exercised, including a wrong lowercase attempt, actual Shift-key events and target feedback. All final-story paragraphs were typed in order (12 Dutch, 14 German), including the preceding reviews, with exact expected persisted attempt/error counters after every task. Result, retained stars after reload and uppercase help in both bonus modes passed. 1024×768 and 390×844 layouts showed no horizontal overflow.
- The original early-lesson → result → arcade → pause/resume → natural end/retry/exit → Magievlucht → reload flows passed again in all four courses. Personal practice/privacy flows passed separately. Final console/page-error and asset checks were clean. Export audit: 148 core pages/assets, 688 literal translation calls, no missing German entries.
- Rapid synthetic input in earlier production runs exposed intermittent React error 185 during the long final story. A once-only completion ref now claims settlement before notifying the external store. Separately, the animated lesson shell subscribes only to needed completion/pause state and completed accuracy; it reads final counters on settlement. Keyboard feedback is derived from current attempts, with local state only for expiry, instead of an immediate extra effect-driven update on every character. Final complete-story runs passed for all four courses at the same fast input rate with exact counter checks and no runtime errors. This records the observed regression and verification; it does not claim a separately isolated React/framework root cause.
- A diagnostic CH development run matched counters without React errors; its asset paths were not used as production asset evidence. Development watching required polling because native watchers hit the host file-descriptor limit. The final browser acceptance used the combined static export, whose assets passed.
- No real regional keyboard/OS test, Safari, actual browser zoom, child-user study or deployment is claimed. No lint configuration was added. Source instructions and the historical uppercase plan now describe the current implementation accurately.
