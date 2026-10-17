# Regional courses: second review

Scope: the regional-course change based on `78a67d5`, including keyboard definitions, all 104 lessons, translation application, save isolation, static routing, consent, metadata, certificates and deployment packaging.

## Findings fixed

- Regional analytics filtering skipped the bare country home paths (`/be`, `/de`, `/ch`) used by client navigation. A pure allowlist now handles both home forms and rejects foreign courses, arbitrary routes, query strings and fragments.
- Deep-page canonical/hreflang/Open Graph URLs inherited course-home values; the privacy page explicitly pointed to Dutch privacy in every course. Shared page metadata now emits corresponding regional pages. Existing duplicate brand suffixes in certificate/imprint titles were removed.
- German exercise data contained `fals` instead of `falls`, avoidable duplicates and a trailing whitespace drill. Corrected without introducing untaught keys or changing mastery thresholds.
- The illustrated certificate seal still contained Dutch text. German courses now use a new code-authored, localized seal in previews, marketing and generated PDFs. Original NL/BE artwork is preserved.
- A direct consent-modal German string used ß in the Swiss course. The shared wording now avoids the discrepancy.
- Invalid export-course values could silently select NL lessons under a different Next base path. The application and export configuration now both reject unsupported values.

## Reviewed contracts

- Physical BE AZERTY versus DE/CH QWERTZ positions, opposing-hand Shift guidance, distinct German ß and Swiss apostrophe keys, uppercase/dead-key scope boundaries.
- Every exercise and bonus target uses cumulatively taught characters. Lesson IDs, scoring, 95% three-star threshold and unlock behavior are unchanged.
- Existing Dutch progress/game keys remain untouched. Other courses use independent suffixes; quiet settings and consent intentionally remain shared.
- Optional analytics remains consent-gated. Typed text, certificate names and progress are not added to statistics. Rejected consent persists while changing courses.
- Next exports remain static, assets resolve within each course, country home RSC aliases are included, and course selection performs full navigation.

## Verification

- 25 Node regression tests passed; explicit TypeScript check passed.
- Complete production build: four exports passed.
- 160 HTML pages checked for language, canonical/hreflang/Open Graph URLs, referenced scripts/styles/images and obvious untranslated visible labels. Swiss visible copy checked for ß.
- 615 literal translation calls checked against the German dictionary: no missing entries.
- Chromium: NL, BE, DE and CH intro → incorrect/correct typing → three stars → bonus → pause/resume/exit → reload. Legacy save preservation and regional characters/Shift checked; 390px and 1024px layouts checked.
- Actual four-course selector navigation with retained consent and legacy NL progress passed. No OpenPanel request after rejection; no JavaScript errors.
- Home client navigation and RSC prefetch aliases passed for all three country mounts.
- German arcade natural end, localized result, retry and exit passed.
- DE/CH PDF download passed; extracted text and rendered German certificate inspected.

Temporary QA scripts, screenshots and PDFs remain outside the repository under `/tmp/lettoria-*`. These are functional/technical checks, not evidence of child-user testing or learning outcomes. Standalone lint remains unavailable because the existing project has no ESLint configuration.

## Delivery

Roger confirmed that pushing the project triggers automatic deployment. Source push and local verification do not prove deployment; production must be checked for the regional HTML, reviewed seal, regional links and live typing behavior after rollout.
