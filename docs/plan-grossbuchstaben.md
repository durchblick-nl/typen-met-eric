# Plan: Großbuchstaben-Erweiterung

## Aktuelle Situation

- 26 Lektionen (0-25)
- Alle Buchstaben sind lowercase
- Shift-Taste wird nie gelehrt
- Kinder lernen nie, wie man Großbuchstaben tippt

## Vorschlag: Neue Region "De Hoofdletterheuvels"

**Position:** Zwischen "De Zee van Snelheid" (19-22) und "Kasteel Compleet"

**Konzept:**
- Shift-Taste = "Magischer Hebel" der Buchstaben groß macht
- Linke Shift für rechte Hand, rechte Shift für linke Hand
- Progressiv: erst einzelne Großbuchstaben, dann Satzanfänge, dann Namen

**Story-Idee:**
> In den Hauptletterheuvels wohnen die Riesen. Sie sprechen nur in GROSSEN BUCHSTABEN.
> Um mit ihnen zu kommunizieren, musst du den magischen Shift-Hebel benutzen!

## Neue Lektionen (5 Stück)

| ID | Titel | Neue Tasten | Beschreibung |
|----|-------|-------------|--------------|
| 23 | De Reus en de Kabouter | Left Shift | Linke Shift + rechte Hand (J, K, L, U, I, O, P, H, N, M) |
| 24 | De Koning en de Koningin | Right Shift | Rechte Shift + linke Hand (F, D, S, A, R, E, W, Q, G, T, B) |
| 25 | Namen en Plaatsen | - | Eigennamen schreiben (Eric, Amsterdam, Nederland) |
| 26 | Zinnen Schrijven | - | Satzanfänge großschreiben + Satzzeichen |
| 27 | Meester van de Letters | - | Alles kombiniert, komplette Sätze |

### Lektion 23: De Reus en de Kabouter
**Neue Taste:** Left Shift

**Übungen:**
```
Jjj, Kkk, Lll, Uuu, Iii, Ooo, Ppp
Jan, Kees, Lies, Udo, Iris, Otto, Piet
Hij heet Jan.
Zij is Lies.
```

**Story:**
> De vriendelijke reus kan alleen maar grote letters verstaan.
> Druk op de LINKER Shift met je linker pink, en typ met je rechterhand!

### Lektion 24: De Koning en de Koningin
**Neue Taste:** Right Shift

**Übungen:**
```
Fff, Ddd, Sss, Aaa, Rrr, Eee, Www, Ggg, Ttt
Frans, Daan, Sara, Anna, Roos, Emma, Willem, Gert, Timo
De koning heet Willem.
```

**Story:**
> De koning en koningin willen hun naam in hoofdletters zien!
> Druk op de RECHTER Shift met je rechter pink, en typ met je linkerhand!

### Lektion 25: Namen en Plaatsen
**Übungen:**
```
Eric, Lettoria, Nederland, Amsterdam
Rotterdam, Utrecht, Den Haag
Ik woon in Amsterdam.
Eric woont in Lettoria.
```

**Story:**
> Namen van mensen en plaatsen schrijf je altijd met een hoofdletter!

### Lektion 26: Zinnen Schrijven
**Übungen:**
```
Hallo! Hoe gaat het?
Ik heet Eric. Wie ben jij?
De zon schijnt. Het is mooi weer.
Kom je mee? Ja, ik kom!
```

**Story:**
> Elke zin begint met een hoofdletter. Na een punt, vraagteken of uitroepteken ook!

### Lektion 27: Meester van de Letters
**Übungen:**
```
De draak Eric woont in Lettoria.
Hij kan vuur spuwen en vliegen.
Wil jij ook leren typen? Ja, graag!
Amsterdam is de hoofdstad van Nederland.
Eric zegt: Goed gedaan!
```

**Story:**
> Je bent bijna klaar! Laat zien dat je alle letters beheerst!

## Technische Änderungen

### 1. VirtualKeyboard.tsx

```typescript
// Nieuwe rij toevoegen voor Shift-toetsen
const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
];

// Shift-toetsen apart renderen
// Links: voor rechterhand letters (YUIOPHJKLNM)
// Rechts: voor linkerhand letters (QWERTASDFGZXCVB)

// Finger mapping voor shift
const SHIFT_FINGER_MAP = {
  'left-shift': 0,  // linker pink
  'right-shift': 7, // rechter pink
};

// Bepaal welke shift nodig is
function getRequiredShift(char: string): 'left' | 'right' | null {
  if (char === char.toLowerCase()) return null;
  const fingerIndex = FINGER_MAP[char.toLowerCase()];
  // Linkerhand (0-3) → rechter shift nodig
  // Rechterhand (4-7) → linker shift nodig
  return fingerIndex <= 3 ? 'right' : 'left';
}
```

### 2. typingStore.ts

```typescript
// Optioneel: Track of correcte shift gebruikt wordt
interface TypingState {
  // ... existing
  shiftPressed: 'left' | 'right' | null;
  correctShiftUsed: boolean;
}
```

### 3. regions.ts

```typescript
// Nieuwe region toevoegen
{
  id: 'heuvels',
  name: 'De Hoofdletterheuvels',
  description: 'Leer hoofdletters met de Shift-toets',
  icon: '⛰️',
  imageUrl: '/images/map/icon-heuvels.png',
  color: 'bg-lettoria-heuvels',
  position: { x: 60, y: 35 },
  requiredLessons: 23,
  lessons: [
    // Lektionen 23-27
  ],
},

// Kasteel IDs aanpassen: 23-25 → 28-30
```

### 4. Neue Bilder generieren

| Dateiname | Beschreibung |
|-----------|--------------|
| `icon-heuvels.png` | Map-Icon für die neue Region |
| `lesson_23_giant.png` | Freundlicher Riese der große Buchstaben mag |
| `lesson_24_royals.png` | König und Königin auf Thronen |
| `lesson_25_names.png` | Ortsschilder mit Namen |
| `lesson_26_sentences.png` | Schreibfeder die Sätze schreibt |
| `lesson_27_master.png` | Alle Charaktere zusammen, Feier |

## Offene Fragen

1. **Strenge Shift-Prüfung?**
   - Option A: Nur prüfen ob Großbuchstabe korrekt ist (einfacher)
   - Option B: Auch prüfen ob richtige Shift-Taste verwendet wird (realistischer)

2. **Caps Lock?**
   - Sollen wir Caps Lock ignorieren/blockieren?
   - Oder als "Cheat" erlauben aber weniger Sterne geben?

3. **Position der Region?**
   - Als eigene Region (mehr Sichtbarkeit)
   - Oder ins Kasteel integrieren (weniger Änderungen)

## Nächste Schritte

1. [ ] Entscheidung: Eigene Region oder Kasteel-Integration
2. [ ] Entscheidung: Strenge Shift-Prüfung ja/nein
3. [ ] VirtualKeyboard.tsx: Shift-Tasten hinzufügen
4. [ ] regions.ts: Neue Lektionen hinzufügen
5. [ ] Bilder generieren
6. [ ] Testen und verfeinern
