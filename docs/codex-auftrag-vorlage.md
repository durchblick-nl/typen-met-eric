# Codex-Auftragsvorlage

Diese Vorlage hilft, Aufgaben so zu formulieren, dass Codex Ziel, Kontext, Regeln und Erfolgskriterien eindeutig versteht.

## Standardvorlage

```text
Ziel:
Setze [konkretes Ergebnis] um.

Kontext:
Die App ist [kurze Beschreibung].
Die Zielgruppe ist [Zielgruppe].
Wichtig ist vor allem [Priorität].

Regeln:
- Ändere nur [Bereich, Feature oder Dateien].
- Behalte [bestehende Logik, Designsystem oder technische Vorgabe] bei.
- Kein [unerwünschtes Verhalten].
- Wenn du während der Umsetzung Risiken findest, behebe sie direkt oder nenne sie klar.

Akzeptanzkriterien:
- [Kriterium 1: sichtbares/prüfbares Ergebnis]
- [Kriterium 2: Verhalten/Logik]
- [Kriterium 3: Responsive/Performance/Accessibility, falls relevant]
- `npm run build` läuft erfolgreich.

Bitte:
- Implementiere die Änderung direkt.
- Teste mit den passenden Befehlen.
- Erkläre danach kurz, was geändert wurde und ob etwas offen geblieben ist.
```

## Beispiel: Bonusspiel verbessern

```text
Ziel:
Verbessere das Bonusspiel so, dass Kinder von 8-12 Jahren klar verstehen:
Münzen fangen, Buchstaben-Hindernisse tippen, Bomben ausweichen.

Kontext:
Lettoria ist ein kostenloser niederländischer Tippkurs für Kinder.
Das Bonusspiel ist eine Belohnung nach einer Lektion mit 3 Sternen.
Das Spiel läuft auf Desktop und iPad im Querformat, aber immer mit Hardware-Tastatur.

Regeln:
- Das Spiel bleibt Tastatur-only, kein Touch-Gameplay.
- Es dürfen nie mehr als 3 Buchstaben-Hindernisse gleichzeitig sichtbar sein.
- Sichtbare Buchstaben dürfen nicht doppelt vorkommen.
- Münzen müssen klar als positive Sammelobjekte erkennbar sein.
- Buchstaben-Hindernisse müssen klar als Tipp-Ziele erkennbar sein.
- Das Spiel soll motivierend, aber nicht hektisch sein.
- Behalte das Arcade-Design bei und verbessere es nur gezielt.

Akzeptanzkriterien:
- Kinder verstehen im Intro sofort: Münzen fangen, Buchstaben tippen, Bomben ausweichen.
- Während des Spiels ist immer klar, welche Buchstaben getippt werden sollen.
- Nie mehr als 3 Tipp-Ziele sind gleichzeitig sichtbar.
- Keine doppelten sichtbaren Tipp-Buchstaben.
- Tempo und Spawnrate passen für Kinder von 8-12 Jahren.
- `npm run build` läuft erfolgreich.

Bitte:
- Setze die Änderung direkt um.
- Teste danach Build und die betroffenen Seiten lokal.
- Fasse die Änderungen kurz zusammen.
```

## Beispiel: Review statt Umsetzung

```text
Ziel:
Reviewe [Bereich/Feature] und finde konkrete Verbesserungen.

Kontext:
[Kurzer Kontext zur App und Zielgruppe.]

Fokus:
- Bugs oder logische Widersprüche
- UX-Probleme für die Zielgruppe
- Design/Lesbarkeit
- Performance oder technische Risiken

Bitte:
- Ändere noch keinen Code.
- Liste Findings nach Priorität.
- Nenne konkrete Dateien und Zeilen.
- Schlage danach die beste Umsetzungsreihenfolge vor.
```

## Beispiel: Schrittweise Umsetzung

```text
Ziel:
Setze die Verbesserungen aus dem Review schrittweise um.

Regeln:
- Arbeite in kleinen, testbaren Schritten.
- Nach jedem größeren Schritt kurz sagen, was geändert wurde.
- Wenn ein Schritt riskant ist, zuerst begründen und dann pragmatisch lösen.
- Bestehende Nutzerfortschritte und lokale Speicherung dürfen nicht kaputtgehen.

Akzeptanzkriterien:
- Jeder Schritt ist einzeln nachvollziehbar.
- Build bleibt grün.
- Keine ungewollten Änderungen außerhalb des vereinbarten Bereichs.
```

