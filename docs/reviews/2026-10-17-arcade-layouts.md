# Arcade keyboard effort and compact coaching

## Scope

Roger requested layout-aware reaction time and clearer keyboard/finger/Shift help for the current Kristaljacht arcade bonus. The legacy MagicFlight component is not used by this lesson flow and is unchanged. Existing rewards, records, mastery, original seal and other artwork remain unchanged.

## Changes

- `keyReactionFactor` derives Shift effort from the selected physical keyboard layout, not a hardcoded language or character list. Shift combinations use a travel-time factor of 1.25 (20% lower target movement speed at the same game speed). On Belgian AZERTY this includes digits and the taught period. Regular QWERTY/QWERTZ digits keep their existing pace.
- Compensation applies only to letter/character targets. Rocks, crystals, spawn cadence, the 75-second round, turbo, hearts, scoring thresholds and rewards retain their existing rules. The existing limit of three unique targets still applies, so throughput is not claimed to be mathematically identical across layouts.
- This factor is an initial, bounded tuning choice, not an empirically validated claim of equal difficulty or a learning-outcome study.
- A compact, non-interactive helper shows the character, physical key, typing hand/finger and opposite Shift key. It picks the available target with the least remaining time, accounting for Shift compensation. It does not intercept keys or steal focus.
- Shift targets carry a small Shift marker. The helper remains static during pause and has no decorative animation.
- Responsive field height and a compact mobile game header keep the helper visible without scrolling at 390×844. Steering still requires hardware arrow keys; no touch gameplay was introduced.
- Instructions refer to characters rather than only letters. Dutch/German feedback is localized.

## Validation

- Regression coverage checks effort for all four layouts, shifted punctuation, unchanged normal-key/hazard motion and round/turbo clocks, extra hit window, deterministic target priority, no mutation, and paused/no-tick behavior.
- Existing scoring, collision, rewards, turbo and duration tests continue to pass.
- 29 core tests, explicit TypeScript check and all four production exports passed. 160 exported pages and 632 literal translation lookups audited without findings.
- Browser-tested all four lesson-15 games with a controlled clock: physical key, correct typing finger/opposite Shift hand, ignored Shift-only input, correct/wrong character input, steering, pause freezing, natural end, retry and exit. After the same simulated second, target depth advances were NL 0.195, BE 0.156, DE 0.195, CH 0.195, confirming the expected 1.25 movement-time factor.
- Helper remained within the viewport at 390×844 and tablet landscape 1024×768 in all courses, with no horizontal overflow or runtime errors. Desktop 1280×1000 screenshots visually checked.
- Full lesson → wrong/correct typing → three stars → arcade → pause/resume/exit → reload passed in all courses, retaining legacy NL storage isolation.
