# Bonusspiele: sichtbarer Fortschritt und freiwilliges Weiterspielen

**Status:** Lokal implementiert und automatisiert sowie im Browser für NL/BE/DE/CH geprüft. Noch nicht committed, gepusht oder veröffentlicht. Ausgangsstand: `36f5197`. Siehe Abnahmeprotokoll am Ende.

**Ziel:** Nach einer Lektion versteht das Kind, was es gelernt und freigespielt hat, und kann selbst zwischen Spielen, Weiterlernen und Aufhören wählen. Die nächste erreichbare Lernaufgabe ist klar. Bereits verdiente Belohnungen bleiben erhalten.

**Erster Schnitt:** Bestehende Bahnen verständlicher benennen, ihren Freischaltzustand korrekt darstellen und die Navigation nach einer Runde verbessern. Kristaljacht bleibt das Hauptspiel, Magievlucht die ruhigere Alternative. Die anschließend beauftragte Zeichensteuerung ersetzt zusätzlich die Pfeilsteuerung; Landschaften und Sammlungsansicht werden nicht erweitert.

**Erwartete Wirkung:** Mehr Orientierung und sichtbarer Lernfortschritt sind eine Designhypothese. Neue Namen und Karten machen aus 26 vorhandenen Bahnen noch keine 26 unterschiedlichen Spielerlebnisse. Motivation und vergleichbare Schwierigkeit auf verschiedenen Tastaturen sind gesondert zu prüfen.

**Umsetzung:** Bestehenden Next.js-Static-Export, TypeScript, Zustand und `tests/core.test.cjs` verwenden. Aufgaben unten sind Arbeitspakete, keine sofort auszuführenden Befehle. Die Umsetzung ist inzwischen beauftragt; Commit, Push und Deployment erfolgen nur mit entsprechender Autorisierung. Es werden keine zusätzlichen Skills, Agenten oder Testframeworks vorausgesetzt.

## 1. Verifizierter Ausgangspunkt

- Es gibt vier Kurse mit jeweils 26 Lektionen, IDs 0–25: NL QWERTY, BE AZERTY, DE QWERTZ und CH QWERTZ. Lehrpläne werden aus `regions.ts` und `courseCurriculum.ts` aufgebaut.
- Im Lektionsfluss sind **beide** Bonusspiele erreichbar: Kristaljacht über `LessonCelebration`, Magievlucht über die Ergebnisaktionen in `LessonClient`. Das historische Rennspiel `CrystalGame.tsx` wird dort nicht verwendet.
- Bahnen verwenden bereits unterschiedliche gelernte Zeichen und Fokuszeichen. Tempo und Spawnabstände steigen mit der Lektion. Drei Landschaften werden wiederverwendet. Die bisherige Bildzuordnung entspricht schon der unten genannten Tabelle; sie braucht für diesen Schnitt keine Änderung.
- Die drei Grot-Dekorationen kosten 8, 16 und 24 Kristalle, zusammen **48**. `arcadeReward()` liefert höchstens **26 pro Runde**: bis zu 24 aus Treffern/Sammeln plus 2 Abschlussbonus bei mindestens drei Treffern. Eine einzelne Runde finanziert daher nicht alle Dekorationen. Ob die Ziele zu schnell erschöpft sind, ist eine offene Designfrage.
- `progressStore.completeLesson()` bewahrt die beste Sternezahl einer Lektion. Eine schwächere Wiederholung nimmt drei verdiente Sterne nicht weg. `nextJourneyLesson()` findet die erste noch nicht gemeisterte Lektion, auch bei Lücken im Speicherstand.
- Die aktuellen Ergebnisse unterscheiden die Genauigkeit dieses Versuchs und das dauerhaft verdiente Meisterschaftsergebnis bereits teilweise. Diese Unterscheidung soll für Texte, Aktionen und Tastenkürzel durchgängig werden.
- Magievlucht akzeptiert die regionalen Zeichen, nennt einzelne Ziffern/Satzzeichen jedoch noch »Buchstaben« und besitzt keine Finger-/Shift-Hilfe. Dieser Plan darf deshalb keine vollständige didaktische Gleichwertigkeit der beiden Spiele behaupten.
- **Beobachteter Layoutfehler:** Der vom Nutzer gelieferte Safari-Screenshot vom 18.10.2026, 15:06:44, zeigt auf `lettoria.nl/ch/les/0` die Kristalljagd-Startkarte mit internem Scrollbalken und unten abgeschnittenem Startknopf. Die Anleitung passt nicht in die begrenzte Spielfeldhöhe, obwohl außerhalb noch Platz vorhanden ist. Die bisherigen lokalen Browser-Stichproben haben diesen Zustand nicht abgedeckt; die Aussage »keine blockierenden Fehler gefunden« belegt daher keine fehlerfreie Startkarte.

## 2. Unveränderliche Verträge

- Mindestens 95 % kumulative Genauigkeit ergeben drei Sterne; mindestens 85 % und weniger als 95 % zwei, darunter einen. Vor der Schwellenprüfung nicht runden. Falsche Versuche zählen auch nach korrekter Wiederholung.
- Die **gespeicherte beste Sternezahl** bestimmt den dauerhaften Bahnzugang. Aktuelle Versuchssternen dürfen diesen Zugang weder löschen noch im UI als verloren darstellen.
- Die nächste Lektion und ihr Bonus sind unterschiedliche Zustände: Drei Sterne in Lektion N öffnen die **Lektion N+1** und die **Bonusbahn N**. Bonusbahn N+1 öffnet erst nach drei Sternen in Lektion N+1.
- Kristaljacht wird ausschließlich über gelernte Zeichen gespielt. Ein richtiger Anschlag bewegt Eric automatisch zur passenden Spur und sammelt deren Kristall oder löst den Felsen auf. Höchstens drei gleichzeitige Ziele mit unterschiedlichen Zeichen und Spuren; sechs Treffer in Folge aktivieren 5,5 aktive Sekunden Turbo. Die Runde dauert maximal 75 aktive Sekunden; es gibt keine Herzen oder zufälligen Kollisionen.
- Ziele nähern sich dem Spieler und bleiben dann bis zum richtigen Anschlag oder Rundenende stehen. Es gibt keine Reaktionsfrist pro Ziel; auch BE-Shift-Ziele warten. Die Tastenhilfe zeigt stabil das älteste Ziel mit physischer Taste, Finger und gegenüberliegender Shift-Hand.
- Magievlucht bleibt bei einem Ziel, 40 richtigen Zeichen oder 60 aktiven Sekunden. Kein automatischer Wechsel zwischen den Spielen.
- Pause friert Spielzeit, Simulation und automatische Spurbewegung ein; Fortsetzen erzeugt keinen Zeitsprung. Ergebnisse werden einmal pro Runde verbucht. Neustart erhält verdienten Fortschritt und leert nur den Rundenstatus.
- Nur bis zur jeweiligen Lektion gelernte Zeichen verwenden. Vorschauen auf spätere Zeichen sind klar als Ausblick gekennzeichnet und gelangen nicht in aktuelle Spielziele.
- Kein Touch-Gameplay, keine Endlosrunde, kein Zeitdruck zum Weiterlernen, keine Rückholbenachrichtigung und keine ausgebaute Tagessträhne. Hardware-Tastatur bleibt erforderlich.
- NL-Schlüssel bleiben `typen-met-eric-progress` und `lettoria-game-store`; regionale Kurse behalten `-be`, `-de`, `-ch`. `lettoria-comfort` bleibt gemeinsam. Keine neue Persistenz, keine Migration und kein Zurücksetzen von Fortschritt.
- Spielrekorde bleiben unter `arcade-{lessonId}` beziehungsweise `magic-{lessonId}` getrennt; historische Rennrekorde bleiben lesbar. Kristallpreise und Belohnungsformeln bleiben unverändert.
- UI-Texte über `t()` mit niederländischem Quelltext und deutschen Einträgen; Schweizer Schreibweise über die bestehende Lokalisierung. Keine neuen Analytics-Ereignisse oder personenbezogenen Daten.

## 3. Gewünschte Abläufe und Sonderfälle

### Nach einer Lektion

| Aktueller Versuch | Dauerhafte Meisterschaft dieser Lektion | Darstellung und Aktionen |
| --- | --- | --- |
| Unter drei Sternen | Noch nicht gemeistert | Versuchsergebnis und konkrete Übungshilfe zuerst. Die **aktuelle** Bonusbahn mit Nummer/Titel als noch geschlossen zeigen. Wiederholen ist die Hauptaktion; die geschlossene Karte hat keinen Spielknopf. |
| Drei Sterne | Jetzt erstmals oder bereits gemeistert | Aktuelle Bahn als offen zeigen; Kristaljacht prominent, Magievlucht als ruhigere Alternative. Weiterlernen und Verlassen bleiben erreichbar. Keine Behauptung »neu freigespielt« bei jeder Wiederholung. |
| Unter drei Sternen | Früher bereits gemeistert | Aktuelles Ergebnis ehrlich zeigen. Dazu »Deine Bahn bleibt offen« und Zugang zu beiden Bonusspielen. Wiederholung bleibt möglich; keine geschlossene Karte und keine Aufforderung, die Belohnung erneut zu verdienen. |

Die geschlossene Karte bezieht sich immer auf die gerade bearbeitete Lektion. Das gilt auch für die letzte Lektion: Ein schwacher erster Versuch schließt den Bonus von Lektion 26 noch nicht auf.

### Nach einer Bonus-Runde

1. Ergebnis zuerst: Punkte, persönlicher Rekord, erspielte Kristalle. Nichts automatisch schließen oder neu starten.
2. Weiterlern-Vorschlag aus der **ersten noch nicht gemeisterten Lektion des gewählten Kurses** ableiten. Bei normalem Verlauf ist das die nächste Lektion; bei einer alten wiederholten Bahn oder Lücken kann es eine andere sein.
3. Vorschau nennt diese Lektion und ihre noch zu verdienende Bonusbahn. Die Hauptaktion heißt »Lektion N üben« und führt zur Lektion, niemals direkt in den geschlossenen Bonus.
4. Weitere Runde bleibt sekundär; Ergebnis verlassen und Grot/Karte bleiben deutlich erreichbar.
5. Sind alle Lektionen gemeistert, führt die Hauptaktion zur Karte. Keine erfundene nächste Bahn oder neue Pflichtaufgabe. Eine letzte Lektion mit früheren Lücken verweist dagegen auf die erste Lücke.

Magievlucht bleibt eine unabhängige Alternative. Ein Kind darf direkt weiterlernen, beide Spiele nacheinander wählen oder ohne Spiel aufhören. Ausstieg aus einem vom Ergebnis gestarteten Spiel führt zum Ergebnis zurück; aus einem von der Intro-Seite gestarteten Kristaljacht-Spiel zurück zur Intro-Seite.

### Tastatur und Fokus

- Auf dem Ergebnis startet Enter nur dann Kristaljacht, wenn die aktuelle Bahn dauerhaft offen ist; andernfalls Wiederholen.
- Auf fokussierten Knöpfen/Links bleibt deren normale Tastaturbedienung maßgeblich. Wiederholungstasten, IME und Browser-Shortcuts dürfen keine Navigation auslösen.
- Nach Spielausstieg einen passenden sichtbaren Auslöser wieder fokussieren. Keine automatische Navigation nach Ablauf eines Timers.
- Bei wenig Platz dürfen Aktionen umbrechen und vertikal erreichbar bleiben. Hauptaktionen müssen ohne horizontales Scrollen oder abgeschnittene Beschriftung bedienbar sein.

## 4. Datenmodell und Zuständigkeiten

**Kein `nextLockedCourse(lessonId)` ohne Fortschrittsdaten.** Der Funktionsname würde einen Sperrzustand behaupten, den die Lektion allein nicht bestimmen kann.

`arcadeCourse(lessonId)` erhält zusätzlich `title` aus dem ausgewählten Lehrplan. `name` bleibt der Regionsname; `keys`, `focusKeys`, Tempo und Simulationsparameter bleiben unverändert.

Für die Ergebnis-/Navigationslogik eine kleine reine Ableitung in `src/lib/journey.ts` ergänzen:

```ts
interface BonusCoursePreview {
  lessonId: number;       // stored ID and route parameter
  lessonNumber: number;   // display number: lessonId + 1
  title: string;          // selected course's lesson title
  focusKeys: string[];    // selected course's newly introduced characters
}

interface BonusJourney {
  current: BonusCoursePreview;
  currentMastered: boolean;
  suggested: BonusCoursePreview | null;
}

// undefined for an unknown current lesson; never invent a fallback course.
function bonusJourney(
  lessonId: number,
  lessonStars: Record<number, number>,
): BonusJourney | undefined;
```

- `currentMastered` wird aus den besten gespeicherten Sternen bestimmt. Das Ergebnis muss nach `completeLesson()` unmittelbar neu abgeleitet werden.
- `suggested` verwendet `nextJourneyLesson()` statt `lessonId + 1` oder einer Anzahl abgeschlossener Lektionen. `null` bedeutet: alle Lektionen gemeistert.
- Bei einer noch nicht gemeisterten aktuellen Lektion kann `suggested` dieselbe Lektion sein; die Ergebnisansicht zeigt dann nur die aktuelle geschlossene Karte statt zweier gleicher Vorschauen.
- Aktuelle Versuchssternen/Genauigkeit bleiben getrennte Eingaben der Ergebnisansicht. Keine Store-Schreiboperationen in dieser Ableitung.
- Aus `focusKeys: []` keine »neuen Tasten« erfinden. Stattdessen »Übe deine gelernten Zeichen«. Leerzeichen als `␣`, `ß` als `ß` und Kombinationen gemäß gewähltem Layout darstellen.
- `LessonClient` leitet den Vorschlag aus dem aktiven Progress-Store ab und kapselt die Navigation zur vorgeschlagenen Lektion beziehungsweise Karte. Beide Bonusspiele verwenden diesen Callback für »Weiterlernen«.
- `ArcadeFlight` erhält die zur Beschriftung nötige Vorschau als Prop. Sichtbarer Zieltext und Navigationscallback müssen denselben aktuellen Vorschlag verwenden; keinen fest auf `lessonId + 1` verdrahteten Handler behalten.

## 5. Umsetzungspakete

### A. Reine Ableitung und Regressionstests

**Dateien:** `src/lib/arcadeFlight.ts`, `src/lib/journey.ts`, `tests/core.test.cjs`.

- [x] Zuerst aussagekräftige Tests für aktuelle Bahn, gespeicherte Meisterschaft und vorgeschlagene Lernaufgabe ergänzen.
- [x] `ArcadeCourse.title` und `bonusJourney()` implementieren; bestehende Journey-Ableitung wiederverwenden.
- [x] Fälle prüfen: leerer Spielstand, erste Meisterschaft, schwächere Wiederholung, bereits offene Folgebahn, Wiederholung einer alten Bahn, Lücken, letzte Lektion mit/ohne Lücken, vollständig gemeisterter Kurs, unbekannte ID, Lektionen ohne neue Zeichen.
- [x] Diese Fälle unter `nl`, `be`, `de`, `ch` mit jeweils frischen Modulinstanzen und wiederhergestellter Kurs-Umgebung prüfen. Titel/Fokuszeichen müssen aus dem jeweiligen Lehrplan stammen.
- [x] Bestehende Genauigkeits-, Physik-, Shift-, Belohnungs- und Speicherkompatibilitätstests müssen weiterhin bestehen. Keine Tests schreiben, die nur statische JSX-Zeichenketten spiegeln.

### B. Ehrliche Ergebnisdarstellung

**Dateien:** `src/components/typing/LessonCelebration.tsx`, `src/app/les/[lessonId]/LessonClient.tsx`, `src/lib/i18n/de.json`.

- [x] Geschlossene **aktuelle** Bahn nur bei fehlender dauerhafter Meisterschaft zeigen. Nummer, Titel und Öffnungsbedingung müssen zur selben Lektion gehören.
- [x] Bei schwächerer Wiederholung Versuchsergebnis und erhaltenen Bahnzugang getrennt darstellen. Bestehende pauschale Texte, die erneutes Freispielen nahelegen, entsprechend anpassen.
- [x] Beide Bonuszugänge nach dauerhafter Meisterschaft erhalten. Das vereinheitlicht bewusst den bislang teilweise versuchsabhängigen Magievlucht-Knopf mit dem dauerhaften Arcade-Zugang.
- [x] Kristaljacht zuerst, Magievlucht mit kurzer Beschreibung darunter. Wiederholen, Weiterlernen und Verlassen bleiben auffindbar.
- [x] Enter-Verhalten und Fokus nach Ausstieg an dieselbe Meisterschaftsentscheidung binden. Aktuelle Sterne dürfen dabei nicht als Ersatz für gespeicherte Meisterschaft dienen.

### C. Benannte Bahnen und konsistente Weiterleitung

**Dateien:** `src/components/game/ArcadeFlight.tsx`, `src/app/les/[lessonId]/LessonClient.tsx`; bei Bedarf die Endkartenbeschriftung in `src/components/game/MagicFlight.tsx`; `src/lib/i18n/de.json`.

- [x] Kristaljacht-Startkarte nennt Bahnnummer, Lektionstitel und Fokuszeichen beziehungsweise Wiederholungshinweis. Steuerung und Shift-Hilfe bleiben sichtbar.
- [x] Den belegten Überlauf der Startkarte beheben, bevor zusätzliche Titel/Zeichen eingefügt werden. Für `ready`, `paused` und `ended` eine inhaltsgerechte Kartenhöhe ermöglichen, statt die gesamte Anleitung samt Hauptaktion in die feste Spielfeldhöhe zu zwängen. Eine mögliche Umsetzung ist eine Karte im normalen Layoutfluss vor Spielbeginn; die laufende Spielfeldgeometrie bleibt unverändert. Details dürfen optional aufklappbar sein, die Grundsteuerung und Hauptaktion bleiben direkt sichtbar. Keine kleinere Schrift als Ersatz für ausreichend Platz.
- [x] Bei kurzen Viewports darf die äußere Ansicht vertikal scrollen. Kein zusätzlicher Scrollbereich innerhalb der Startkarte; kein abgeschnittener oder erst durch internes Scrollen auffindbarer Startknopf. Dieselbe Regel für Fortsetzen und Ergebnisaktionen prüfen.
- [x] Endkarte zeigt nach dem Ergebnis die vorgeschlagene Lernaufgabe mit einem eindeutigen Lernknopf. Kein spielbarer Knopf für eine geschlossene Bonusbahn.
- [x] Wiederholen sekundär, Grot/Karte und Ausstieg weiterhin erreichbar. Magievlucht nutzt denselben Weiterlern-Callback und darf kein abweichendes Ziel ankündigen.
- [x] Keine automatische Folge-Lektion oder Folge-Runde starten. Belohnungen nicht beim Navigieren erneut verbuchen.
- [x] Keine Änderung an `arcadeLandscape()` nötig. Bestehende Zuordnung bewahren:

| Region | Vorhandenes Bild |
| --- | --- |
| grot, dorp, velden, woud, kasteel | `arcade-track.webp` |
| toppen | `arcade-mountains.webp` |
| zee | `arcade-coast.webp` |

### D. Lokalisierung und Abnahme

**Dateien:** `src/lib/i18n/de.json`, betroffene Komponenten, `tests/core.test.cjs`.

- [x] Alle neuen Quelltexte durch `t()` führen und deutsche Übersetzungen ergänzen. BE verwendet niederländische Texte; CH erhält Schweizer Schreibweise. Platzhalter als Parameter übergeben, keine übersetzten Satzfragmente zusammensetzen.
- [x] Die lokale automatisierte Browsermatrix durchführen und gefundene Regressionen beheben; verbleibende Hardware-/Safari-Abnahme separat ausweisen.
- [x] Zusammenfassen, was implementiert wurde, welche Prüfungen bestanden und welche produktiven/hardwarebezogenen Nachweise fehlen. Keine Veröffentlichung aus lokalen Tests ableiten.

## 6. Vorschlag für Kindtexte

Endgültige Texte im Zusammenhang prüfen; folgende vollständige Sätze geben Ton und Bedeutung vor.

| Bedeutung | Dutch source for `t()` | German |
| --- | --- | --- |
| Aktueller Bonus geschlossen | Baan {n} is nog gesloten | Bahn {n} ist noch geschlossen |
| Öffnungsbedingung | Haal drie sterren in les {n} om deze baan te openen. | Schaffe drei Sterne in Lektion {n}, um diese Bahn zu öffnen. |
| Dauerhafter Zugang | Je hebt deze baan al vrijgespeeld. Je kunt blijven spelen. | Du hast diese Bahn schon freigespielt. Du kannst sie weiter spielen. |
| Lernvorschlag | Oefen les {n}: {title} | Übe Lektion {n}: {title} |
| Ausblick | Met drie sterren in les {n} open je deze bonusbaan. | Mit drei Sternen in Lektion {n} öffnest du diese Bonusbahn. |
| Keine neuen Zeichen | Oefen met je geleerde tekens. | Übe mit deinen gelernten Zeichen. |
| Ruhigere Alternative | Liever rustig typen? Kies Erics magievlucht. | Möchtest du lieber in Ruhe tippen? Wähle Erics Magieflug. |
| Alles gemeistert | Je hebt alle banen vrijgespeeld. Kies zelf wat je wilt spelen. | Du hast alle Bahnen freigespielt. Wähle selbst, was du spielen möchtest. |

Keine Verlustdrohungen, künstliche Knappheit oder Behauptung, das Kind müsse weiterspielen. Der Ausblick zeigt eine Möglichkeit und kein Defizit.

## 7. Testmatrix und Abschlusskriterien

### Automatisiert

- [x] Neue Ableitungstests aus Paket A für alle vier Kurse.
- [x] Bestehende Speicher-Hydration und beste Sterne erhalten; getrennte Kurs- und Spielrekorde bleiben erhalten.
- [x] `npm test`.
- [x] `npx tsc --noEmit --incremental false`.
- [x] Dev-Server vor dem Build stoppen; `npm run build` exportiert alle vier Kurse gemeinsam.

`npm run lint` gilt weiterhin nicht als bestandener Check: Es fehlt die ESLint-Konfiguration. Die interaktive Einrichtung gehört nicht zu diesem Auftrag.

### Im Browser, für NL / BE / DE / CH

Temporäre Profile verwenden; echte gespeicherte Nutzerdaten weder überschreiben noch löschen. Für spätere Lektionen dürfen nur Testprofile gezielt vorbereitet werden. Mit einer kontrollierten Uhr weiterhin die echten Ereignishandler und gerenderten Komponenten prüfen.

| Fall | Erwarteter Nachweis |
| --- | --- |
| Schwacher erster Versuch | Fehler bleibt am Zielzeichen, zählt zur Genauigkeit; aktuelle Bonusbahn geschlossen; Wiederholen funktioniert. |
| Erfolgreicher Versuch | Drei Sterne; aktuelle Bahn spielbar; folgende Lektion erreichbar, deren Bonus noch geschlossen. |
| Schwächere Wiederholung | Bestwerte bleiben drei Sterne; keine falsche Sperre; beide Bonusspiele und Enter funktionieren. |
| Alte Bahn / Lücke | Lernknopf und Zielroute stimmen mit der ersten noch nicht gemeisterten Lektion überein. Keine falsche Behauptung über eine schon offene Bahn. |
| Letzte Lektion | Schwacher erster Versuch zeigt deren geschlossene Bahn; bei Meisterschaft mit Lücken geht es zur ersten Lücke, ohne Lücken zur Karte. |
| Beide Spiele | Intro → echte Eingabe → Ergebnis → Bonus → Pause/Fortsetzen → Ende → Neustart/Ausstieg; keine doppelte Belohnung; Fortschritt nach Reload erhalten. |
| Unterschiedliche Tastaturen | BE-Ziffer und Punkt mit Shift, DE-Umlaute/ß, CH-ss-Schreibweise, sichtbares Leerzeichen; nur gelernte Zeichen im Spiel. |
| Kurse wechseln | Vollständige Kursnavigation; Titel/Zeichen passen zum Kurs; andere Spielstände bleiben unverändert. |
| Barrierearme Bedienung | Tab, Shift+Tab, Enter und Ausstieg; sichtbarer Fokus; Status auch ohne Farbe/Ton verständlich; ruhige Darstellung bleibt wirksam. |
| Layout | Desktop und Tablet quer mit Hardware-Tastatur; 390 px auf Overflow und erreichbare Menüs prüfen, ohne Touch-Spielbarkeit zu behaupten. |
| Startkarte mit langen Texten | DE und CH ausdrücklich bei 1280×800 und 1024×768 sowie 200 % Browserzoom prüfen; NL/BE gegenprüfen. Startknopf vollständig sichtbar, sobald die Karte im äußeren Scrollbereich erreicht ist; kein internes Kartenscrolling. Grundsteuerung lesbar. `ready`, `paused` und `ended` separat aufnehmen und den Start tatsächlich anklicken. |

Zusätzlich Route/Titel, Inhalte, relevante Konsolenfehler, Asset-Ladevorgänge und Screenshots prüfen. Synthetische Browser-Zeichenereignisse sind kein Nachweis realer OS-Tastaturbelegung. Reale BE-/DE-/CH-Hardwaretests und Erprobung mit Kindern als separate Nachweise kennzeichnen.

**Fertig ist dieser Schnitt**, wenn alle vorgesehenen Zustände die richtige aktuelle Bahn und erreichbare Lernaufgabe zeigen, beide Bonusspiele freiwillig erreichbar bleiben und Tests, Typprüfung, Vierfachbuild sowie Browsermatrix ohne offene Regression bestehen. Neue Landschaften, längere Spielzeit oder gesteigerte Motivation werden damit nicht als umgesetzt erklärt.

## 8. Bewusst getrennte Folgeschritte

1. **Magievlucht: Zeichen- und Shift-Hilfe.** »Zeichen« statt pauschal »Buchstaben«; passende physische Taste, Finger und gegenüberliegende Shift-Hand auch für belgische Ziffern/Satzzeichen. Die vorhandene Anleitung sinnvoll wiederverwenden; vorab prüfen, ob dafür eine gemeinsame Komponente passt. Danach gezielte Browserprüfung aller Layouts. Das ist eine priorisierte Bedienungsverbesserung, aber kein Teil der reinen Fortschrittskarten.
2. **Mehr spielerische Abwechslung.** Zuerst einen kleinen Prototyp für einen weiteren Abschnitt entwerfen: Welche neue, verständliche Aufgabe macht ihn anders, welche gelernten Zeichen trainiert er, und warum bleibt er fair? Keine zusätzliche Mechanik allein aufgrund einer Lektionsnummer einführen. Erst nach Prüfung entscheiden, ob sieben Regionen eigene Muster oder Landschaften erhalten.
3. **Grot und optionale Bahnsammlung.** Prüfen, ob Kinder ihre freigespielten Bahnen bereits gut wiederfinden. Nur bei Bedarf eine Übersicht mit direkt spielbaren offenen Bahnen planen. Weitere Grot-Ziele mit den Regionen verbinden, ohne Preise still zu erhöhen oder gekaufte Dekorationen zu verlieren.
4. **Balance und Motivation praktisch prüfen.** Beobachten, ob Kinder Freischaltung, nächsten Lernschritt, Shift-Hilfe und Ausstieg verstehen; ob Ziele lesbar und Zeitfenster angemessen sind. Keine längere Sitzungsdauer als alleinigen Erfolg definieren und kein Tracking von Texteingaben einführen. Ergebnisse als kleine Erprobung beschreiben, nicht als belegte Lernwirkung.
5. **Historischen Renncode separat bereinigen.** Erst Referenzen, Assets und Speicherkompatibilität inventarisieren. Nicht im Zuge dieser Oberflächenänderung löschen.

## 9. Evidenz und Grenzen

Am 18.10.2026 am Stand `36f5197` geprüft: Lektionsphasen, beide Bonus-Einstiege, beste gespeicherte Sterne, Journey-Ableitung, Arcade-Regeln, Belohnungsobergrenze und Grot-Preise.

Die vorgelagerte technische Prüfung dieser Sitzung umfasste 29 bestandene Regressionstests, Simulationen der beiden Spiele für alle 104 Lektionen, vollständige Browserabläufe ab der ersten Lektion in allen vier Kursen, zusätzliche Arcade-Stichproben späterer Lektionen, belgische Shift-Zeichenereignisse und lokale Export-/Übersetzungsprüfungen. Der Vierfachbuild und die Typprüfung bestanden zuvor ebenfalls. Diese Nachweise betreffen den **bestehenden Code**, nicht die hier geplanten Änderungen.

Für diese Dokumentüberarbeitung ist nur die Konsistenz des Plans mit dem gelesenen Code und `git diff --check` zu prüfen. Sie implementiert keine Funktion. Es gibt weiterhin keinen Nachweis aus Kinder-Erprobungen oder vollständigen Tests mit realen regionalen Hardwaretastaturen.

Nachträgliche Nutzerevidenz: `Screenshot 2026-10-18 at 15.06.44.png` zeigt den oben beschriebenen Überlauf der CH-Startkarte in Safari auf der Produktionsseite. Die genaue CSS-Viewportgröße und Zoomstufe sind aus dem Bild nicht sicher ableitbar. Der Befund ist im ersten Umsetzungsschnitt zu beheben; eine erneute lokale Browserprüfung und ein gesonderter Safari-/Produktionsnachweis nach Veröffentlichung bleiben erforderlich.


## 10. Lokale Abnahme der Fortschrittskarten vor der Zeichensteuerung

- Implementiert: `ArcadeCourse.title`, reine `bonusJourney()`-Ableitung, aktuelle geschlossene Bahn statt falscher Folgebahn, dauerhaft offene Bonuszugänge bei schwächeren Wiederholungen, konsistente Enter-/Fokusbehandlung und gemeinsamer Lernvorschlag für beide Spielenden. Lektionswechsel starten mit eigenem lokalen Phasenstatus und einem frischen Tippversuch.
- Start-/Pause-/Endkarten sind inhaltsabhängig hoch. Grundsteuerung und Start bleiben direkt sichtbar; zusätzliche Tipps sind aufklappbar. Die laufende Simulation und ihre Feldhöhe, Punkte, Dauer, Belohnungen und Shift-Faktoren wurden nicht verändert.
- 31 Core-Tests bestanden, einschließlich der neuen Vierkurs-Tests für Meisterschaft/Lücken/Abschluss und vollständige Kleinbuchstaben-Abdeckung. Explizite Typprüfung und vollständiger Vierfachbuild bestanden. 148 exportierte Kernseiten samt Assets und 634 feste Übersetzungsaufrufe geprüft, keine fehlenden Wörterbucheinträge.
- Browser: lokaler Export mit Playwright und Chrome; Browser-Plugin nicht verfügbar. Isolierte Testprofile. In allen vier Kursen schwacher Versuch, Erfolg, schwächere Wiederholung, beide Bonusspiele, Pause/Fortsetzen, Ende/Neustart/Ausstieg, Enter, Fokusrückgabe und Fortschritt nach Reload geprüft. Zusätzlich alte Bahn mit Lücke, letzte gemeisterte Lektion mit/ohne Lücke und schwacher erster Versuch der letzten Lektion geprüft. Keine verbleibenden Laufzeit- oder Assetfehler in den abschließenden Läufen.
- Die Testuhr wurde vor dem Laden eingerichtet und längere Simulationen in Abschnitten ausgeführt; DOM-Zustände werden vor Eingaben abgewartet. Frühere Testabbrüche durch eingefrorene Übergänge, entfernte DOM-Elemente oder Playwrights fehlende Unicode-Tastennamen wurden im Testablauf bereinigt. Ein zunächst beobachteter React-185-Fehler war in den abschließenden synchronisierten Läufen und zusätzlichen Echtzeit-Prüfungen nicht mehr reproduzierbar; daraus wird keine separat behobene Produktionsursache behauptet.
- Darstellung: 1280×800, 1024×768, 390×844 und 640×400 CSS-Pixel; zusätzlich 200 % Grundschriftgröße. Karten ohne internes Scrollen/Clipping, aufgeklappte Tipps und Hauptaktionen geprüft; Echtzeit-Screenshots aller vier Startkarten visuell kontrolliert. Kleinere CSS-Fläche und größere Schrift ersetzen keinen echten Browserzoom-/Safari-Nachweis.
- Zusätzliche Echtzeit-Prüfung ohne virtuelle Uhr: Start, Pause/Fortsetzen, Ausstieg mit Fokusrückgabe und Kurswechsel mit getrennten Speichern für alle vier Kurse. Belgische Shift-Ziffer per physischem Code und Zeichenereignis erfolgreich; deutsche Umlaute in den Abschlussübungen per Unicode-Tastaturereignis geprüft.
- Weiterhin offen als externe Nachweise: echte BE-/DE-/CH-Hardwaretastaturen, Safari einschließlich tatsächlichem Browserzoom, Produktion nach Veröffentlichung und Erprobung mit Kindern. Standalone-Lint bleibt mangels ESLint-Konfiguration ungeprüft. Temporäre Prüfscripte und Screenshots liegen außerhalb des Repositorys.
- Das zusätzliche wissenschaftlich eingeordnete Lehrplanreview steht in `docs/reviews/2026-10-18-typing-curriculum.md`. Seine Empfehlungen zu Wiederholung und Bewertung sind nicht Teil einer stillschweigenden Lehrplanänderung.


## 11. Ergänzung: reine Zeichensteuerung (18.10.2026)

Der Nutzer hat die Pfeilsteuerung ausdrücklich verworfen: Die Hände sollen zum Tastschreiben bei der Grundstellung bleiben. Diese Änderung ersetzt die früheren Bewegungs-, Kollisions- und Reaktionszeitregeln aus Abschnitt 10 und den älteren Arcade-Reviews.

- **Eingabe:** Nur gelernte sichtbare Zeichen lösen Spielaktionen aus. Keine Pfeiltasten oder Ersatz-Lenktasten. Pfeile werden im Spielfeld ohne Spielwirkung abgefangen, damit sie das Feld nicht wegscrollen. Menüs, Pause und Ausstieg behalten ihre normale Tastaturbedienung.
- **Ziele:** Maximal drei Zeichen, höchstens eines pro Spur. Jedes Zeichen gehört sichtbar zu einem Kristall oder Felsen. Richtige Anschläge bewegen Eric zu diesem Ziel und lösen es auf. Falsche Anschläge verändern weder Ziel noch Zielspur; sie zählen zur Versuchsgenauigkeit, unterbrechen die Trefferfolge und geben ermutigende Hilfe.
- **Bewegung:** Automatische Spurwechsel dauern 240 aktive Millisekunden und folgen ausschließlich der Simulationszeit. Pausen frieren auch eine angefangene Bewegung ein. Bei reduzierter Bewegung wird die neue Spur unmittelbar angezeigt.
- **Zeit und Hindernisse:** Ziele halten bei Tiefe 0,72 an und bleiben tippbar. Die Gesamtrunde endet nach 75 aktiven Sekunden. Keine passiven Sammelpunkte, wegfliegenden Ziele, Herzen oder Kollisionen, die eine zusätzliche Steuerung erfordern.
- **Punkte:** 150 Basispunkte pro richtigem Zeichen, bestehender Serienmultiplikator und doppelte Punkte während 5,5 Sekunden Turbo nach sechs Treffern. Kein Timingbonus für absichtliches Warten auf eine Linie. Kristallziele erhöhen zusätzlich die gesammelten Kristalle; Felsziele werden durch die richtige Taste aufgelöst. Belohnungsobergrenze und gespeicherte `arcade-{lessonId}`-Bestwerte bleiben erhalten; alte Rekorde und Käufe werden nicht gelöscht.
- **Darstellung:** Genauigkeit ersetzt die Herzanzeige. Alle aktuellen Anleitungen und Rückmeldungen verwenden die neue Zeichensteuerung in NL/BE beziehungsweise DE/CH. Veraltete Wörterbucheinträge für historische Komponenten sind kein aktiver Spieltext.
- **Abnahme:** Regressionen für wartende Ziele, automatische Bewegung/Stillstand bei Pause, einmalige Belohnung, Turbo, vier regionale Zeichensätze und unveränderte Rundendauer. Browserprüfung der Pfeiltasten ohne Spielwirkung, echter Zeichenaktionen, BE-Shift und DE/CH-Sonderzeichen, Pause/Fortsetzen, Ergebnis/Neustart/Ausstieg und gespeicherten Fortschritts. Die früheren Prüfungen der Pfeilsteuerung sind kein Nachweis für diesen Stand.

### Lokale Abnahme der Zeichensteuerung

- 28 Core-Tests, explizite Typprüfung und vollständiger Vierfachbuild bestanden. Die neue parametrische Spielprüfung umfasst alle 104 Lektionen und ihre gelernten Zeichen; frühere Tests für abgelöste Kollisions-/Reaktionszeitregeln wurden ersetzt. 148 exportierte Kernseiten samt referenzierten Assets und 628 feste Übersetzungsaufrufe geprüft, keine fehlenden Wörterbucheinträge.
- In isolierten Chrome-Profilen alle vier Kurse geprüft: erste Lektion mit falschem und richtigem Versuch, drei Sterne, Bonusstart, Pfeile ohne Spielwirkung, falsche Eingabe ohne Zielverlust, richtige Eingabe mit automatischem Spurwechsel, wartende Ziele ohne passive Punkte, Pause/Fortsetzen, natürliches Rundenende, einmalige Belohnung, Neustart, Ausstieg mit Fokusrückgabe und Fortschritt nach Reload. Der Magievlucht-Abschluss mit 40 Zeichen besteht weiterhin.
- Spätere Lektionen zusätzlich mit Leerzeichen, belgischer Shift-Ziffer, deutschem ß und Schweizer ü per Browser-Tastaturereignis geprüft. Darstellung bei 1024×768 und 390×844 ohne horizontalen Überlauf. In den abschließenden Läufen keine Laufzeit- oder Assetfehler.
- Zusätzlicher Echtzeitlauf ohne virtuelle Uhr und ohne reduzierte Bewegung: automatischer Spurwechsel interpoliert, friert während der Pause ein und setzt danach fort; gehaltene Tasten erzeugen keine zusätzlichen Treffer. Start-/Spielansichten aller vier Varianten aufgenommen; temporäre Prüfscripte und Screenshots liegen außerhalb des Repositorys.
- Diese Nachweise gelten für den lokalen Export in Chrome. Reale regionale Hardwaretastaturen, Safari, tatsächlicher Browserzoom, Produktion nach Veröffentlichung und Erprobung mit Kindern bleiben separate Nachweise. Keine Veröffentlichung durchgeführt; gespeicherte Nutzerfortschritte wurden nicht verändert. Lint bleibt mangels Konfiguration ungeprüft.
