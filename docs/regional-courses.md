# Regional courses

## Course exports

`npm run build` exports the shared application four times, with a build-time `NEXT_PUBLIC_LETTORIA_COURSE`, and combines the output under the existing static `out/` directory. Next's `basePath` keeps links, client navigation and JS bundles within the chosen course. The export also creates `/be.txt`, `/de.txt` and `/ch.txt` aliases for Next home-link prefetches. Public illustration and sound paths remain shared. No runtime service or new domain is needed.

| Course | Path | Language | Keyboard |
|---|---|---|---|
| nl | `/` | nl-NL | Dutch QWERTY (existing course) |
| be | `/be/` | nl-BE | Belgian AZERTY |
| de | `/de/` | de-DE | German QWERTZ |
| ch | `/ch/` | de-CH | Swiss German QWERTZ |

`npm run build:course` exports only the selected environment course for development. The default is NL. Do not deploy a single-course export over the combined site.

## Learning contracts

- All courses retain the seven regions and lesson IDs 0–25, scoring and unlock thresholds.
- NL curriculum and its existing persistence keys are unchanged. New courses use suffixed lesson/game storage keys. Switching course performs a full navigation; it never deletes another course's progress. Quiet settings remain shared.
- BE follows physical home-row positions (`Q S D F … J K L M`); Dutch word exercises are selected from taught letters rather than letter-substituted. Numbers and the period require Shift with the opposite hand. Semicolon and comma have their Belgian physical positions. The layout is Belgian, not French AZERTY.
- DE and CH use Z on the top row and Y on the bottom. Ö is introduced with A, Ü alongside O/P, Ä alongside X/N, and DE-only ß alongside B/punctuation. CH has no ß key and uses Swiss ss spelling in stories, UI and exercises.
- German stories and exercises are authored separately. Both optional games derive their keys from the selected curriculum; the magic-flight vocabulary is language-specific.
- Keyboard references checked against the installed xkeyboard-config `be(basic)`, `de(basic)` and `ch(basic)` symbol definitions. The display covers the course's letter, digit and punctuation training keys, not every OS-specific modifier or dead-key variant.
- German copy is kept in `src/lib/i18n/de.json`, looked up through `t()`. Dutch remains source copy. New UI must be localized deliberately; a missing German key falls back to Dutch.

## Validation

Run `npm test`, `npx tsc --noEmit --incremental false` and `npm run build`. Core tests check cumulative taught characters, physical guidance, BE Shift, DE/CH differences, isolated save keys and bonus targets. Browser tests must use temporary profiles, verify each course's language, links and real typing flow, and preserve existing NL progress.
