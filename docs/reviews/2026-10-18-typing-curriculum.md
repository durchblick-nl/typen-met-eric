# Typing curriculum review against research evidence

Date: 2026-10-18. Scope: all 26 lessons in each of NL QWERTY, BE AZERTY, DE QWERTZ and CH QWERTZ; physical finger guidance, practice, feedback and mastery. Curriculum data inspected at `36f5197`; the concurrent bonus-navigation work does not change exercise data or mastery thresholds.

## Assessment

Lettoria has a reasonable foundation for incremental touch-typing instruction, but completing its current course is not evidence of retained mastery of every letter. All 26 lowercase Latin letters occur in each curriculum. The main weaknesses are sparse later practice of rare letters, fixed rather than adaptive review, and treating a single aggregate lesson score as permanent mastery. Correct finger use is explained but cannot be verified from browser key events.

Recommend **systematic incremental touch typing with distributed cumulative practice, explicit finger guidance, accuracy-focused feedback, and separate transfer/retention checks**. This is a research-informed framework, not a proprietary method or a claim that Lettoria's precise letter order, 95% threshold or exercise dose is experimentally validated.

## Evidence and applicability

1. **Gahshan and Weintraub, WoTIP (online 2024; journal volume 2025).** A study of 51 children aged 9–10 in two schools compared a combined typing/word-processing program with a control school. The program used gradual character introduction, accuracy-first instruction, finger associations, goals and later application tasks. Typing-speed improvement favored instruction at follow-up. Schools, rather than individual children, were assigned; the intervention combined several elements. It does not isolate an optimal key order, validate a universal 95% gate, or demonstrate the effect of a standalone browser game. [Original study, methods and results](https://link.springer.com/article/10.1007/s11145-024-10613-9).
2. **Baddeley and Longman (1978).** Four training schedules for adult postal workers favored distributing typing practice over days rather than massing it into longer daily training. This supports spacing as a design principle; it does not prescribe a session length for 8–12-year-olds. [Original article and abstract](https://www.tandfonline.com/doi/abs/10.1080/00140137808931764).
3. **Feit, Weir and Oulasvirta (CHI 2016).** Motion tracking of 30 everyday typists associated faster performance with consistent finger-to-key mappings, preparation and limited global hand movement. Self-taught typists sometimes matched trained touch typists. This observational adult study supports consistent guidance but cannot establish that ten-finger instruction or one specific mapping is the uniquely best method for children. [Original research paper](https://userinterfaces.aalto.fi/how-we-type/resources/HowWeType_CHI16.pdf).
4. **Glencross and colleagues (1989).** A field study of 197 schoolchildren aged 11–18 reported speed improvements after intensive instruction, with error rates remaining constant. It supports the feasibility of structured instruction for older children, not an optimal dose for younger learners or proof that speed gains imply accuracy gains. [Original study abstract](https://pubmed.ncbi.nlm.nih.gov/15676725/).

These sources support components of a teaching approach. They do not establish learning outcomes for Lettoria, equivalence between its four layouts, or superior spelling/composition simply because a child plays its bonus games.

## Findings from the actual curricula

### 1. High priority: rare letters receive very little practice after introduction

Counts below are literal character opportunities in one complete pass through mandatory lesson exercises, including drills. They exclude stories, retries, free practice and randomized optional games. IDs are stored IDs; displayed lesson numbers are one greater.

| Course | Exercise characters in one pass | Illustrative low-frequency letters | After the introducing lesson |
| --- | ---: | --- | --- |
| NL | 4,137 | q: 12; x: 12; y: 16 | q and x have only 1 additional occurrence each |
| BE | 6,264 | q: 21; y: 26; x: 34 | All appear, but totals alone do not establish distributed retention |
| DE | 2,231 | y: 8; x: 9; q: 10; ß: 8 | y, x and q have 1 additional occurrence each; ß has none |
| CH | 2,221 | y: 8; x: 9; q: 10 | Each has only 1 additional occurrence |

Evidence: `src/lib/data/regions.ts`, `src/lib/data/courseCurriculum.ts`; counts obtained by loading the real TypeScript curriculum separately under each build-time course value. No lowercase a–z letter was missing. DE includes ö/ü/ä/ß; CH includes ö/ü/ä and Swiss ss spelling. This does not cover dedicated uppercase instruction, which remains planned.

**Implication:** A child can finish the course with almost no later mandatory retrieval of a difficult rare letter. Optional randomized games cannot guarantee that review happened. This is a code-derived learning risk, not an observed failure in children.

**Recommendation:** Add authored, meaningful later exercises that revisit every introduced letter across several subsequent lessons. Mix familiar and newer transitions, including words where possible. Keep a small deliberate drill where vocabulary would otherwise exclude q/x/y/ß; do not distort real words to satisfy keyboard coverage. Track introduction, later lesson appearances and transitions, rather than only total character counts. Any numeric coverage targets should be explicit pilot design choices, not described as research-proven thresholds.

### 2. High priority: aggregate accuracy can conceal a weak key

The store correctly counts retries and computes unrounded cumulative accuracy. However, one score summarizes every key. Example: NL lesson ID 10 contains 136 target characters, including 11 q characters. Four wrong q attempts, each followed by a correct retry, still yield 136/140 = 97.14% overall, while q accuracy is 11/15 = 73.33%. That earns three stars under the current, intentional rule.

Evidence: `getStars()` and `handleKeyPress()` in `src/lib/stores/typingStore.ts`; `LessonClient.tsx` accumulates the whole attempt. The existing per-key statistics can explain this discrepancy.

**Recommendation:** Preserve the existing 95% star/unlock contract during this bonus implementation. Add optional targeted review and distinguish “lesson passed” from evidence that every key is secure. Evaluate per-key first-try accuracy on a sufficient sample and again on later material before proposing any new mastery gate. Do not revoke existing stars or introduce an unreviewed minimum count/threshold.

### 3. High priority: no planned delayed review or independent retention check

The result screen offers a warmup based on mistakes in the current attempt. `progressStore` aggregates key attempts/errors, but the course does not schedule a revisit after a delay or measure an unfamiliar transfer passage. `/oefenen` cycles five fixed home-row exercises; it is not a review of all learned letters or persistent weak keys.

**Recommendation:** Offer a brief, optional mixed warmup on return, restricted to already learned characters. Separate two purposes: extra practice now and a later low-pressure check using new combinations. Space opportunities over subsequent lessons and return visits, without daily streak pressure. Calendar-based scheduling would require a separate backwards-compatible persistence design; do not claim the current aggregated store already contains recency data.

### 4. Medium priority: course dose and introduction complexity differ substantially

BE contains about 2.8 times as much mandatory text as CH in one pass. The difference is code-derived; it is not measured learning time. BE adds generated drills to filtered Dutch material, while German uses shorter authored exercises. DE lesson ID 14 introduces b, period, comma and ß together. BE's digit lessons add three shifted characters at once.

**Recommendation:** Normalize instructional structure before trying to normalize raw length: demonstrate a small movement, practice it deliberately, mix it with known movements, then use it in meaningful text. Subdivide dense introductions within existing lesson IDs if needed. Review pacing and hand effort separately for BE Shift, DE ß/umlauts and CH spelling. Neither identical character counts nor a numeric reaction-time allowance establishes equal difficulty.

### 5. Medium priority: guidance is available, but not a finger-use assessment

`keyboards.ts` maps course characters and opposite-hand Shift. `VirtualKeyboard` highlights physical keys/fingers and `ArcadeKeyGuide` shows target guidance. JavaScript receives the character and key event, not which finger produced it. Magievlucht lacks equivalent Shift/finger help and calls digits/punctuation “letters”.

There is also a concrete display inconsistency outside the new bonus cards: `JourneyPreview.tsx` calls `toUpperCase()` on every upcoming key, turning German ß into SS. Preserve ß as a single target character, as the lesson intro and new bonus focus labels already do. This is a UI correction, not a proposal to change German spelling or the curriculum.

**Recommendation:** Keep stable layout-specific mappings, clear F/J orientation and an optional practice demonstration. Explain that guidance is an instruction, not a verified skill. Add the already identified Magievlucht help as a separate UI improvement. A later optional reduction of visual guidance can be explored with learners; do not abruptly hide the keyboard or require physical covers without assessing accessibility and comfort.

### 6. Medium priority: permanent best scores are not a fluency or transfer measure

Accuracy, useful retry feedback and the delayed WPM display are sensible. However, repeated fixed strings can improve immediate performance without demonstrating fluency on new text. Best stars intentionally persist; the app does not measure whether performance remains after a break. Uppercase/Shift-letter composition is not yet taught as a complete sequence.

**Recommendation:** Keep stars as earned progress. Describe the diploma as completing this course rather than an independently validated universal typing qualification. Plan separate unfamiliar text tasks and later checks, preserving legibility and the accuracy-first approach. Do not add timed speed requirements to the early lessons as part of this review.

## Proposed lesson pattern for a subsequent curriculum change

This is a design proposal derived from the evidence and observed gaps, not a tested protocol for Lettoria:

1. Show the selected keyboard, F/J orientation, target movement and finger/Shift hand.
2. Introduce a small set of keys; use short repetitions to establish movement.
3. Alternate new movements with already learned ones; provide actionable correction.
4. Apply them in real Dutch/German words and short sentences using only taught keys.
5. Show the attempt result and offer focused practice for weak keys, without withholding already earned rewards.
6. Revisit selected old keys in later lessons and on a later return; use unfamiliar combinations for the check.
7. Offer a natural stopping point and optional short bonus, without presenting game survival as typing mastery.

Do not prescribe a “proven” number of minutes or key repetitions. Session length, cue reduction, coverage targets and the size of new-key groups need an explicit small pilot with the intended age group.

## Recommended implementation order and acceptance

1. **First:** complete and verify the currently authorized bonus/navigation/layout work. It must not silently reorder lessons, change the star policy or reset progress.
2. **Next curriculum proposal:** author later rare-letter review in each language; make the exercise coverage audit reproducible; specify which new combinations are teaching versus checking. Preserve IDs and old saves.
3. **Then:** design optional weak-key review and Magievlucht guidance. Define any new saved data and migration separately before implementation.
4. **Validation:** all exercises remain within cumulative taught characters; every introduced letter appears in meaningful later review; physical guidance matches each course; old NL and regional saves remain compatible. The specification should name chosen coverage targets and justify them as design choices.
5. **Learning evaluation:** with appropriate consent, compare initial and later performance on unfamiliar taught-key text, record accuracy and speed separately, and observe finger-use understanding, fatigue and ability to stop. Include children across the intended ages and relevant layouts. A small usability pilot can reveal confusion; causal efficacy claims require a stronger comparative study. Keep typed text and personal input out of analytics.

No curriculum, lesson order, thresholds or persistence schema has been changed by this review. No child-user study or real regional hardware study has been performed. Automated completeness is a necessary technical check and does not demonstrate teaching effectiveness.

The core regression suite now explicitly checks introduction and exercise coverage of the full lowercase alphabet in each course, including DE ä/ö/ü/ß and CH ä/ö/ü, plus direct practice of each newly introduced character. This protects technical coverage; it intentionally does not turn the observed exposure counts into arbitrary pedagogical pass thresholds.

Subsequent implementation note (2026-10-18): the user-authorized typing-only arcade removes arrow steering, passive collisions, hearts and individual target deadlines. Correct learned characters now drive automatic flight and resolve targets. This reduces the separate steering demand; it does not resolve the mandatory curriculum coverage, later review or learning-evaluation findings above.

## Subsequent curriculum revision (2026-10-18)

The user has now authorized a research-informed mixed practice sequence. The initial counts and findings above describe the earlier curriculum and are retained as the review baseline. `docs/plans/2026-10-18-curriculum-practice.md` records the implementation and source limitations. All four courses now add explicit movement/mixing tasks and three later retrieval lessons for each introduced group, using authored words or explicit drills and only learned characters. Run `npm run audit:curriculum` for current exposure counts. The intervals are editorial choices; later lesson positions do not guarantee elapsed time. Stars, saved mastery, IDs and key order remain unchanged. Adaptive/date-based review and independent learning evaluation remain open.

Further user-authorized additions on the same date: explicit uppercase practice in existing IDs 19–21 and a complete final Eric story. The original lowercase/Shift findings above are a historical baseline. Current finger help distinguishes Swiss Caps Lock umlauts from opposite-hand Shift; personal error practice now reuses local aggregate counters. This does not add per-key recency, independent retention tests or measured learning efficacy.
