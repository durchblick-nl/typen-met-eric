# /goal: Bonusspiel als motivierendes Typen-Lern-Spiel

## Ziel

Verbessere Eric's Race so, dass es fuer Kinder von 8-12 Jahren ein klares, motivierendes Tastatur-Arcade-Spiel ist.

Kinder sollen sofort verstehen:
- Muenzen fangen.
- Buchstaben-Hindernisse tippen.
- Bomben ausweichen.
- Nicht per Touch spielen, sondern mit Hardware-Tastatur.

## Kontext

Lettoria ist ein kostenloser niederlaendischer Tippkurs fuer Kinder.
Das Bonusspiel wird nach einer Lektion mit 3 Sternen freigeschaltet.
Das Spiel laeuft auf Desktop und iPad im Querformat, aber immer mit Tastatur.

## Regeln

- Das Spiel bleibt Tastatur-only.
- Kein Touch-Gameplay einbauen.
- Es duerfen nie mehr als 3 Buchstaben-Hindernisse gleichzeitig sichtbar sein.
- Sichtbare Tipp-Buchstaben duerfen nicht doppelt vorkommen.
- Wenn mehrere passende Buchstaben im State existieren, muss der dringendste/naechste getroffen werden.
- Muenzen muessen visuell und textlich klar positive Sammelobjekte sein.
- Buchstaben-Hindernisse muessen klar Tipp-Ziele sein und duerfen nicht wie Sammelobjekte wirken.
- Das Tempo muss fuer Kinder von 8-12 Jahren motivierend, aber nicht hektisch sein.
- Das Arcade-Design soll stark, klar und hochwertig bleiben.
- Bestehende Fortschritte in localStorage duerfen nicht kaputtgehen.

## Akzeptanzkriterien

- Intro erklaert kindgerecht: Muenzen fangen, Buchstaben tippen, Bomben ausweichen.
- Im Spiel ist jederzeit klar, welche Buchstaben getippt werden sollen.
- Maximal 3 Tipp-Ziele sind sichtbar.
- Keine doppelten sichtbaren Tipp-Buchstaben.
- Spawnrate und Geschwindigkeit sind spuerbar ruhiger als ein hektisches Arcade-Spiel.
- Progression auf Karte und Regionen zaehlt klar Lektionen mit 3 Sternen.
- Belohnungen und Texte sprechen konsistent von Muenzen, nicht Gems/Kristallen, ausser in normalen Story-Texten.
- `npm run build` laeuft erfolgreich.
- Betroffene Seiten werden lokal geprueft: `/les/0`, `/kaart`.

## Vorgehen

1. Reviewe kurz die aktuelle Implementierung und nenne nur Blocker, falls vorhanden.
2. Setze die Aenderungen direkt um.
3. Teste mit `npm run build`.
4. Pruefe lokal die betroffenen Seiten.
5. Fasse kurz zusammen, was geaendert wurde und was offen bleibt.
