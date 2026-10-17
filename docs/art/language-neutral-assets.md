# Language-neutral illustrations and keyboard refresh — 2026-10-17

Roger's direction: games are the central motivational hook for completing the typing course, not incidental decoration. This pass improves the practice keyboard without changing mastery rules or game rewards.

## Active graphics

69 existing raster assets were visually screened. Characters, scenery, map icons and game props are language-neutral. The number/cloud illustration uses shared numerals. Two exceptions have been addressed:

- `public/images/stories/lesson_10_fortuneteller_neutral.webp`: removes the English banner from the story illustration, shared by all courses. Created with the built-in image-generation edit tool, visually checked, then exported to WebP. The original image remains as an unused historical source.
- Certificate seal: Roger rejected the simplified replacement. All courses now retain the original illustrated `public/images/diploma/lettoria_seal.png` unchanged. Do not replace or redesign this artwork as part of language-neutralization. The experimental neutral seal is unused.

Image edit prompt: “Make it entirely language-neutral: remove the parchment banner and ALL lettering at the bottom, naturally reconstruct the jester's clothing and fortune teller's robe behind it. Preserve the two characters' identities, faces, poses, crowd, magical creatures, watercolor texture, colors, landscape composition and framing. No text, no letters, no logo, no watermark anywhere. Change only the banner area; retain the rest faithfully.”

Future artwork should contain no embedded prose. Put any labels in translated UI text, not pixels. Brand name LETTORIA is shared across languages.

## Keyboard

- Forest-green chassis, ivory tactile keycaps, consistent key widths and staggered rows.
- Stable finger colors, clear current-key outline, permanent F/J bumps.
- Opposite-hand Shift guidance and corresponding little-finger outline; thumbs highlighted for space.
- Correct/wrong feedback affects only the pressed key. No perpetual finger pulsing or whole-board shaking.
- Quiet mode and OS reduced-motion preference suppress key movement, retaining color/symbol feedback.
- Existing progress, curriculum, scoring and games are unchanged.

## Validation

- 25 core tests and explicit TypeScript check passed; four-course production build passed.
- All four exported keyboards browser-tested at desktop and 390px: key/finger mapping, F/J bumps, BE opposite-hand Shift, DE/CH key differences, correct/wrong feedback, cleanup, local quiet mode and OS reduced-motion preference.
- Full lesson → inaccurate/correct input → mastery → arcade → pause/resume/exit → reload passed for all four courses; legacy NL progress preserved across regional courses.
- DE and CH certificate PDFs generated successfully using the shared seal.
- 160 exported pages passed language, canonical/hreflang/OpenGraph and local-asset checks. 618 translation lookups audited with no missing German keys.
- No game/reward/scoring changes. No Grok review was performed in this pass.

## Correction

2026-10-17: Restore the original illustrated seal across all courses at Roger’s explicit request. Keyboard and text-free story illustration remain unchanged.
