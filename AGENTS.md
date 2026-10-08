# AGENTS.md

Repository instructions for coding agents working on Lettoria. Follow the user's current request; read more specific instructions when working in a subdirectory.

## Product and scope

Lettoria is a free Dutch typing tutor for children aged 8–12. Eric the dragon guides the child through a story about restoring magic to seven regions. No account or payment is required. Production: `https://lettoria.nl`; staging: `https://typen.treehouse.ch`.

- Write child-facing copy in simple, encouraging Dutch. Keep engineering documentation in English unless requested otherwise.
- Protect the learning experience: accurate typing, correct finger use, readable targets and understandable feedback come before speed or spectacle.
- Treat German/English support, Shift lessons and offline support as planned work, not implemented features. Check the code before making product claims.
- Keep this file focused on working rules. Store detailed designs in `docs/`; do not add feature-completion checklists here.

## Setup and commands

Use npm and the committed `package-lock.json`. Match tool versions to `package.json` and the lockfile rather than assuming the latest framework API.

```bash
npm ci                              # Install the locked dependencies when needed
npm run dev                         # Local Next.js development server
npm run build                       # Production build and static export into out/
npx tsc --noEmit --incremental false # Type check without a persistent cache
npm test                            # Core regression tests (Node test runner + TypeScript compiler)
npm run lint                        # next lint; see current limitation below
```

Current limitation: no ESLint configuration is checked in. Core tests are in `tests/core.test.cjs`. `npm run lint` opens an interactive configuration prompt; it is not currently a passing CI check. Report this accurately. If lint setup is part of the task, configure it deliberately and rerun it; do not silently accept the prompt or claim lint passed.

`next.config.mjs` uses `output: 'export'` and unoptimized images. Keep functionality compatible with static hosting: no required server actions, runtime API routes, database calls or server-only authentication. `npm run start` invokes `next start`; serve `out/` for a production export instead. Stop the dev server before a production build to avoid sharing `.next/` between processes.

## Where to work

- `src/lib/data/regions.ts`: authoritative curriculum, lesson IDs, new keys, exercises and stories. There are currently 26 lessons, IDs 0–25, in seven regions. Derive totals from this data where possible.
- `src/app/les/[lessonId]/LessonClient.tsx`: lesson phases, cumulative accuracy, results and the bonus-game handoff.
- `src/lib/stores/typingStore.ts` and `src/lib/hooks/useKeyboard.ts`: typing state, timing, scoring and keyboard handling.
- `src/components/typing/`: target text, virtual keyboard and finger guidance.
- `src/lib/stores/progressStore.ts`: persistent lesson progress.
- `src/components/game/ArcadeFlight.tsx` and `src/lib/arcadeFlight.ts`: three-lane bonus race unlocked by lesson mastery, deterministic state engine, typing targets, arrow movement, 75-second round, hearts and turbo.
- `src/components/game/MagicFlight.tsx` and `src/lib/magicFlight.ts`: current optional bonus game, typing targets, 40-character goal, 60-second active clock and rewards.
- `src/components/game/GrotRewards.tsx` and `src/lib/stores/gameStore.ts`: local decorations, game records and crystals. Original race components/abilities remain as historical implementation; they are not used by the lesson flow.
- `src/components/game/FlightDragon.tsx`: separated dragon body, wing and tail atlas, poses derived from the arcade simulation clock; no independent animation timers.
- `src/lib/arcadeMusic.ts` and `public/sounds/celesta-quest.mp3`: optional Kristaljacht music, loaded only after opting in and starting play. Preserve the supplied recording; pause/resume keeps its position and a new race restarts it. Music and effects have separate controls, both off initially. Dispose playback and pending loads on exit.
- `src/components/settings/ComfortSettings.tsx`: local quiet setting, shared motion configuration and OS motion preference.
- `src/components/map/WorldMap.tsx`, `src/app/kaart/`, `src/app/regio/`: progression and navigation.
- `src/components/eric/Eric.tsx`, `src/app/globals.css`, `tailwind.config.ts`, `public/images/`: character, shared visual language and assets.
- `src/app/diploma/` and `src/components/diploma/`: local certificate preview and PDF download.

## Typing and progression contracts

- Exercise text must use only keys taught up to that lesson. Check the whole curriculum when changing exercise data, including spaces, punctuation, digits and case.
- The current curriculum and finger map assume Dutch QWERTY. Do not imply other keyboard layouts are supported. Keep target characters and finger guidance consistent.
- Currently 95%+ cumulative lesson accuracy earns three stars and unlocks the next lesson; 85–94% earns two stars, below 85% one star. Any change to this policy is a product change, not a cosmetic adjustment.
- Calculate accuracy from correct characters / all attempts, without rounding before star thresholds. Wrong attempts stay at the same target and count even after a correct retry. Show WPM only after 15 active seconds and 20 correct characters; exclude pauses and inter-key idle gaps above 10 seconds.
- Do not count movement or passive survival as typing mastery. Focus warmups do not award lesson stars.
- Give actionable feedback for difficult keys. Keep mistakes encouraging and let the child retry.
- Handle key repeat, modifier shortcuts, focus, IME/composition and navigation deliberately. Do not accidentally consume typing in form inputs or count browser shortcuts as practice.
- Keep completed lessons, three-star mastery, game stars and game highscores distinct. Map, regions and diploma must agree on the same lesson-mastery rules.

## Bonus-game design and behavior

- Make the game replayable through satisfying typing, fair challenge, visible improvement and a connection to Lettoria's story.
- Preserve hardware-keyboard gameplay. Do not add touch gameplay without a requested product change; menus and exit controls still need to work on supported devices.
- A typing reward should exercise the learned keys. Do not silently replace newly taught letters with movement-only abilities when designing a new mode.
- Kristaljacht separates controls from taught characters: arrows steer; learned characters shoot visible letter targets. Keep at most three live letter targets with unique characters. Turbo lasts 5.5 active seconds after six consecutive hits. Every simulation clock, collision, effect and sprite animation pauses together.
- New arcade courses unlock at three-star lesson mastery and remain available after a weaker retry. Keep their records under `arcade-{lessonId}` so they do not compete with magic or legacy race records.
- The magievlucht has one target at a time. Correct characters advance the target; wrong attempts break the streak without moving the target. It ends at 40 correct characters or 60 active seconds.
- Use `kristallen` consistently for the current bonus rewards. Historical `totalGems` and race scores remain compatible; magic scores use `magic-{lessonId}` keys so unlike score scales do not compete.
- Teach one mechanic at a time. Introduce additional abilities and hazards only when the child understands the core loop.
- Give each round a clear goal and readable end state. Retry, continue and exit must be available without trapping the child or automatically dismissing results before they can read them.
- Pause must freeze movement, collisions, spawning, game clocks, power-ups and scoring. Resuming must not produce a catch-up burst. Handle loss of visibility/focus deliberately.
- Restart must clear timers and transient effects, award results once, and preserve earned progress.
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
- Preserve the Zustand persistence keys `typen-met-eric-progress` and `lettoria-game-store`; local quiet settings use `lettoria-comfort`. Changes to their schema require backwards-compatible hydration or an explicit migration; never reset real progress to make a feature work.
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
