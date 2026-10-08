# Eric's illustrated adventure

The map, lesson celebration and arcade share Lettoria's warm illustrated world: emerald Eric, cream belly, gold horns and crystals, soft painterly lighting, round silhouettes and readable controls. Artwork is decoration; lesson accuracy, unlocked courses, balances and growth are rendered from actual local progress.

## Design references

Two visual concepts guided this iteration: a next-adventure band above a cozy grot with a decoration panel, and a wide lesson celebration above native stars, accuracy and a clear arcade reward. The existing world map remains between the adventure band and the grot. No account/avatar control from the initial concept is implemented.

## Production assets and generation briefs

All six assets were generated with the built-in ImageGen tool, inspected and encoded as WebP at quality 88. The briefs below document their intended composition for future matching artwork; they are not a runtime generation feature.

| Asset in `public/images/game/` | Brief and role                                                                                                                                                                                                                                                                                                  |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grot-home.webp`               | Cozy warm stone dragon grot, empty central rug for Eric, arched window overlooking a lake and distant castle, books without lettering and empty shelves. No dragon, decorations, words or interface baked into the background. Approximately 8:5.                                                               |
| `lettoria-props.webp`          | Transparent 1536 × 1024 atlas with six centered objects in equal 512-square cells. Top row: golden crystal, rounded mossy rock, magical flowering plant. Bottom row: warm lantern, hanging golden star mobile, open crystal treasure chest. Matching soft painted fantasy style, separate silhouettes, no text. |
| `eric-reward.webp`             | Wide 5:2 celebration panorama. Cheerful green Eric at left, gold stars and crystals, restored Dutch village, river, bridge and distant castle at right. Keep the center calm; no words, buttons or embedded numeric result.                                                                                     |
| `arcade-mountains.webp`        | Empty three-lane alpine fantasy flight route: snow-capped mountains, pine trees, flowers, stone paths, bridge and chalet. Same perspective and visual language as the existing forest track; no characters, hazards or letter targets baked in.                                                                 |
| `arcade-coast.webp`            | Empty three-lane sandy coastal fantasy route: blue sea, rope edges, dolphins, lighthouse and distant castle. Same perspective as the forest and mountain tracks; no characters, hazards, text or interface.                                                                                                     |

## Rendering and behavior

- The props atlas uses `background-size: 300% 200%`, with column positions 0/50/100% and row positions 0/100%. Do not stretch the square cells or replace transparency with a flat background.
- `public/images/eric/eric-growth.webp` adds three matching transparent growth portraits in equal square cells, one horizontal row: round baby with tiny wings, confident teen with larger wings, proud adult with broad wings. Emerald scales, cream belly, gold horns and warm smile follow the grot concept. An edit restored transparent padding around the adult's horn. `EricPortrait.tsx` addresses the cells with `background-size: 300% 100%`; original mood images remain available.
- Eric, the selected purchased decoration and the earned treasure chest are separate grot overlays. Growth thresholds and stored purchases remain compatible.
- The current attempt earns the lesson celebration only at three stars. An already earned arcade remains accessible after a weaker retry, without showing a false three-star celebration.
- Mountain and coast backgrounds follow curriculum regions. Targets, collision geometry, simulation clocks, music and reward rules stay independent of the artwork.
- Keep the target letters native and high contrast. Pause and quiet-motion settings continue to control game animation. Grot bobbing respects both the saved quiet setting and OS reduced motion.
- The next adventure is the first lesson below three stars. A completed curriculum leads to the diploma. No new stored state or analytics event is required.
- Games remain optional, with 75-second arcade rounds and explicit retry, next-lesson, grot and exit choices.
