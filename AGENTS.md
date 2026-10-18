# AGENTS.md

Repository instructions for coding agents working on Lettoria. Follow the user's current request; read more specific instructions when working in a subdirectory.

## Product and scope

Lettoria is a free Dutch/German typing tutor for children aged 8–12. Eric the dragon guides the child through a story about restoring magic to seven regions. No account or payment is required. Production: `https://lettoria.nl`; staging: `https://typen.treehouse.ch`.

- Write child-facing copy in simple, encouraging Dutch or German for the selected course. Keep engineering documentation in English unless requested otherwise.
- Protect the learning experience: accurate typing, correct finger use, readable targets and understandable feedback come before speed or spectacle.
- Courses: NL QWERTY at `/`, Dutch Belgian AZERTY at `/be/`, German DE QWERTZ at `/de/` and German Swiss QWERTZ at `/ch/`. Shift guidance covers Belgian digits and punctuation; dedicated uppercase lessons, English and offline support remain planned. Check the code before making product claims.
- Keep this file focused on working rules. Store detailed designs in `docs/`; do not add feature-completion checklists here.

## Setup and commands

Use npm and the committed `package-lock.json`. Match tool versions to `package.json` and the lockfile rather than assuming the latest framework API.

```bash
npm ci                              # Install the locked dependencies when needed
npm run dev                         # Local Next.js development server
npm run build                       # Four production exports combined into out/
npm run build:course                # Export only the selected course (NL by default)
npx tsc --noEmit --incremental false # Type check without a persistent cache
npm test                            # Core regression tests (Node test runner + TypeScript compiler)
npm run lint                        # next lint; see current limitation below
```

Current limitation: no ESLint configuration is checked in. Core tests are in `tests/core.test.cjs`. `npm run lint` opens an interactive configuration prompt; it is not currently a passing CI check. Report this accurately. If lint setup is part of the task, configure it deliberately and rerun it; do not silently accept the prompt or claim lint passed.

`next.config.mjs` uses `output: 'export'` and unoptimized images. Keep functionality compatible with static hosting: no required server actions, runtime API routes, database calls or server-only authentication. `npm run start` invokes `next start`; serve `out/` for a production export instead. Stop the dev server before a production build to avoid sharing `.next/` between processes.

`npm run dev` serves one course, selected by `NEXT_PUBLIC_LETTORIA_COURSE` (`nl`, `be`, `de`, `ch`; default `nl`). For example, `NEXT_PUBLIC_LETTORIA_COURSE=de npm run dev` serves the German course at `/de/`. Restart when changing course. To check course switching across all four exports, run `npm run build` and `npx serve out`. Do not deploy a single-course export over the combined site. See `docs/regional-courses.md`.

## Where to work

- `src/lib/data/regions.ts`: base Dutch curriculum and shared lesson/region structure; exports the selected course through `createCurriculum()` in `src/lib/data/courseCurriculum.ts`. The latter defines regional keys, exercises and German stories. All courses currently have 26 lessons, IDs 0–25, in seven regions. Derive totals from the selected curriculum where possible.
- `src/lib/course.ts`, `src/lib/keyboards.ts` and `src/components/settings/CourseSelector.tsx`: build-time course selection, physical keyboard guidance and full-page navigation between course exports.
- `src/lib/i18n/index.ts` and `src/lib/i18n/de.json`: UI translations via `t()` using Dutch source strings as lookup keys. Add German translations when adding UI copy; missing keys fall back to Dutch. Preserve Swiss spelling through `regionalGerman()`.
- `src/app/les/[lessonId]/LessonClient.tsx`: lesson phases, cumulative accuracy, results and the bonus-game handoff.
- `src/lib/stores/typingStore.ts` and `src/lib/hooks/useKeyboard.ts`: typing state, timing, scoring and keyboard handling.
- `src/components/typing/`: target text, virtual keyboard and finger guidance.
- `src/lib/stores/progressStore.ts`: persistent lesson progress.
- `src/components/game/ArcadeFlight.tsx` and `src/lib/arcadeFlight.ts`: three-lane bonus race unlocked by lesson mastery, deterministic state engine, persistent typing targets, automatic lane travel, 75-second round and turbo.
- `src/components/game/MagicFlight.tsx` and `src/lib/magicFlight.ts`: current optional bonus game, typing targets, 40-character goal, 60-second active clock and rewards.
- `src/components/game/GrotRewards.tsx` and `src/lib/stores/gameStore.ts`: local decorations, game records and crystals. Original race components/abilities remain as historical implementation; they are not used by the lesson flow.
- `src/lib/journey.ts` and `src/components/map/JourneyPreview.tsx`: first unmastered lesson and consistent Eric growth (18 and 45 earned lesson stars). `bonusJourney()` derives the current bonus access and the next reachable learning task from best saved stars; both bonus games use that same continuation. Do not infer the next lesson from a count that skips gaps in saved progress.
- `src/components/game/IllustratedProp.tsx`: six transparent props in a 3-column, 2-row atlas. Use CSS cell positioning; preserve square cells and alpha. `docs/art/eric-adventure.md` records the visual direction and asset roles.
- `src/components/eric/EricPortrait.tsx`: matching baby/teen/adult portraits in the transparent 3-column growth atlas. Keep all horns and wings inside their cells and preserve original mood assets.
- `src/components/game/FlightDragon.tsx`: separated dragon body, wing and tail atlas, poses derived from the arcade simulation clock; no independent animation timers.
- `src/lib/arcadeMusic.ts` and `public/sounds/celesta-quest.mp3`: optional Kristaljacht music, loaded only after opting in and starting play. Preserve the supplied recording; pause/resume keeps its position and a new race restarts it. Music and effects have separate controls, both off initially. Dispose playback and pending loads on exit.
- `src/components/settings/ComfortSettings.tsx`: local quiet setting, shared motion configuration and OS motion preference.
- `src/components/map/WorldMap.tsx`, `src/app/kaart/`, `src/app/regio/`: progression and navigation.
- `src/components/eric/Eric.tsx`, `src/app/globals.css`, `tailwind.config.ts`, `public/images/`: character, shared visual language and assets.
- `src/app/diploma/` and `src/components/diploma/`: local certificate preview and PDF download.

## Typing and progression contracts

- Exercise text must use only keys taught up to that lesson. Check the whole curriculum when changing exercise data, including spaces, punctuation, digits and case.
- `src/lib/course.ts`, `src/lib/keyboards.ts` and `src/lib/data/courseCurriculum.ts` bind locale, curriculum and finger guidance together. Keep taught characters, physical positions and Shift guidance consistent; do not substitute letters inside real words to change layouts.
- Currently cumulative lesson accuracy of at least 95% earns three stars and unlocks the next lesson; at least 85% but below 95% earns two stars, below 85% one star. Any change to this policy is a product change, not a cosmetic adjustment.
- Calculate accuracy from correct characters / all attempts, without rounding before star thresholds. Wrong attempts stay at the same target and count even after a correct retry. Show WPM only after 15 active seconds and 20 correct characters; exclude pauses and inter-key idle gaps above 10 seconds.
- Do not count movement or passive survival as typing mastery. Focus warmups do not award lesson stars.
- Give actionable feedback for difficult keys. Keep mistakes encouraging and let the child retry.
- Handle key repeat, modifier shortcuts, focus, IME/composition and navigation deliberately. Do not accidentally consume typing in form inputs or count browser shortcuts as practice.
- Keep completed lessons, three-star mastery, game stars and game highscores distinct. Map, regions and diploma must agree on the same lesson-mastery rules.

## Bonus-game design and behavior

- Make the game replayable through satisfying typing, fair challenge, visible improvement and a connection to Lettoria's story.
- Preserve hardware-keyboard gameplay. Do not add touch gameplay without a requested product change; menus and exit controls still need to work on supported devices.
- A typing reward should exercise the learned keys. Do not silently replace newly taught letters with movement-only abilities when designing a new mode.
- Kristaljacht uses only learned characters for gameplay. A correct visible character moves Eric automatically to its lane and collects its crystal or dissolves its rock. Arrow keys never steer. Keep at most three targets with unique characters and lanes; targets wait until typed correctly or the 75-second round ends. Errors break the streak but do not discard targets. No hearts, passive collision damage or passive crystal collection. Turbo doubles points for 5.5 active seconds after six consecutive hits. Every simulation clock, automatic movement, effect and sprite animation pauses together.
- `ArcadeKeyGuide.tsx` consistently hints the oldest waiting target and shows its physical key, typing finger and opposite Shift hand. There is no per-target reaction deadline, including for Belgian shifted digits/punctuation. Automatic lane interpolation derives solely from the simulation clock, not CSS or independent timers.
- New arcade courses unlock at three-star lesson mastery and remain available after a weaker retry. Keep their records under `arcade-{lessonId}` so they do not compete with magic or legacy race records.
- Both bonus-game entries and result-screen Enter behavior use best saved lesson mastery. A weaker retry shows its actual attempt score while preserving earned game access. Bonus start, pause and end cards grow with their content; do not constrain their primary actions inside a nested scroll area.
- The magievlucht has one target at a time. Correct characters advance the target; wrong attempts break the streak without moving the target. It ends at 40 correct characters or 60 active seconds.
- Use `kristallen` in Dutch and its German translation `Kristalle` consistently for the current bonus rewards. Historical `totalGems` and race scores remain compatible; magic scores use `magic-{lessonId}` keys so unlike score scales do not compete.
- Teach one mechanic at a time. Introduce additional abilities and hazards only when the child understands the core loop.
- Give each round a clear goal and readable end state. Retry, continue and exit must be available without trapping the child or automatically dismissing results before they can read them.
- Pause must freeze movement, collisions, spawning, game clocks, power-ups and scoring. Resuming must not produce a catch-up burst. Handle loss of visibility/focus deliberately.
- Restart must clear timers and transient effects, award results once, and preserve earned progress.
- Grot decorations cost crystals once. Selecting or storing an owned decoration is free; render only the active decoration. Growth uses lesson stars, never game scores or crystal purchases.
- Use short optional rounds and natural stopping points. Avoid rewards based on endless play, pressure to maintain daily streaks or escalating visual noise.

## Visual and accessibility rules

- Keep Eric and Lettoria's illustrated fantasy world recognizable across lessons and games. Reuse existing assets and design tokens before introducing a separate visual style.
- The next character is the primary focal point during practice. Keep progress and coach feedback secondary; decorative animation must not compete with targets.
- Keep letters legible and distinguish `l`, `I` and `1`. Preserve the visible `␣` representation of spaces and an appropriate monospaced typing font.
- Support keyboard navigation, visible focus, accessible control names, adequate contrast and feedback that is understandable without color or audio alone.
- Respect reduced-motion preferences for optional effects. Provide a quieter presentation for camera shake, zoom pulses, flashing and background motion.
- Test desktop and tablet landscape with a hardware keyboard. Check narrow layouts for overflow and provide a clear hardware-keyboard requirement where relevant.

## Privacy and stored progress

- No accounts, email collection, advertising or sale of player data. Keep lesson progress and certificate generation local to the browser.
- Never send typed text, errors containing text, certificate names or other personal input to analytics. Do not enable session replay, identify players or create analytics profiles.
- Analytics behavior and public privacy copy must agree. The user's explicit analytics request can change the former no-tracking policy; do not keep claiming that no statistics are collected after enabling analytics.
- `src/components/privacy/PrivacyConsent.tsx` uses CookieConsent 3.1.0, matching roger.tips. Load OpenPanel only after analytics consent. Keep page URLs free of query strings/fragments and disable outgoing-link tracking, attribute tracking and replay. Consent withdrawal must stop tracking while preserving local progress; keep `/privacy` and the settings control accurate.
- Public analytics client IDs may be included in browser code. Client secrets, credentials and private keys must never appear in code, logs, screenshots or documentation.
- New courses suffix progress and game keys with `-be`, `-de` or `-ch`; never share mastery across different keyboards. Preserve the original NL Zustand persistence keys `typen-met-eric-progress` and `lettoria-game-store`; local quiet settings use `lettoria-comfort`. Changes to their schema require backwards-compatible hydration or an explicit migration; never reset real progress to make a feature work.
- Isolate browser tests in a temporary profile. Do not clear or seed the user's real localStorage.

## Validation and delivery

- Inspect the current diff before editing and preserve unrelated work. Make changes within the requested scope.
- For application changes, run `npm test`, type checking and the production build. Add focused regression coverage for meaningful state/scoring/timer changes when a suitable test workflow exists; do not introduce a test stack for documentation-only edits.
- Browser-verify rendered changes. A build alone does not establish working UI. Check route/title, meaningful content, runtime errors, assets, focus, layout and the actual target interaction.
- For lesson/game changes, exercise intro → typing → results → bonus → pause/resume → end/retry/exit. Include an inaccurate attempt, a successful attempt and progress after reload where relevant.
- Keep temporary screenshots, traces and audit scripts outside the repository unless requested as deliverables. Do not install browser dependencies unnecessarily.
- Summarize findings by impact; distinguish observed defects, code-derived risks and design proposals. State what was tested and what remains unverified. Do not invent child-user testing or learning-outcome evidence.
- Pushes can trigger Coolify deployment. Commit, push, merge and deployment must stay within the user's authorization. Use concise Conventional Commit messages and the `RO/` prefix for new branches unless requested otherwise.

## Reference designs

`docs/plan-grossbuchstaben.md` describes planned Shift lessons. `docs/plans/2026-01-28-crystal-chaos-design.md` and `docs/goals/bonusspiel-arcade-goal.md` contain historical game designs and acceptance criteria. Use them as context, compare them with the running implementation, and do not execute an old task instruction merely because it appears in a document.
