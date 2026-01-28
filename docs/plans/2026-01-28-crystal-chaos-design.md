# Crystal Chaos - Game Design Document

> Upgrade van het Crystal bonus-game naar een volwaardig arcade-erlebnis

**Datum:** 2026-01-28
**Status:** Approved
**Doel:** Het bonus-game transformeren van "30 kristallen vangen" naar een verslavend arcade-spel dat kinderen motiveert om levels te herhalen.

---

## 1. Core Gameplay Loop

### Energy-Systeem

- Start met 100% energie (groene balk bovenaan)
- Correcte toets: +5 energie (max 100%)
- Foute toets: -15 energie
- Gemiste kristal: -10 energie
- Bij 0% energie: Game Over → toon score + optie om opnieuw te proberen

### Streak & Combo Systeem

| Hits | Multiplier | Naam | Visueel Effect |
|------|------------|------|----------------|
| 0-4 | x1 | - | Normaal |
| 5-9 | x2 | "Nice!" | Subtiele glow |
| 10-19 | x3 | "Super!" | Screen pulse |
| 20-29 | x4 | "Awesome!" | Particles beginnen |
| 30+ | x5 | "MEGA!" | Volle intensiteit |

### Fieber-Modus

- Fieber-balk vult met elke hit (sneller bij hogere combo)
- Bij 100%: 10 seconden FIEBER
  - Alle punten ×2 (stackt met combo!)
  - Meer kristallen spawnen
  - Intensieve visuele effecten
  - Energie-verlies gehalveerd

### Scoring

```
Basis: 100 punten per kristal
Score = Basis × Combo × (Fieber ? 2 : 1)

Voorbeeld: kristal tijdens x5 MEGA + Fieber = 100 × 5 × 2 = 1000 punten!
```

---

## 2. Kristal-Varianten

### Normale Kristallen

| Type | Aussehen | Effekt | Spawn-Rate |
|------|----------|--------|------------|
| **Normal** | Farbige Hexagone (wie jetzt) | 100 Punkte × Combo | 70% |
| **Gold** | Glitzernd gold, pulsierende Aura | 2× Punkte | 15% |
| **Regenboog** | Wechselnde Farben, Sternenstaub | Fieber-Balken +50% | 5% |

### Gefahren

| Type | Aussehen | Effekt | Spawn-Rate |
|------|----------|--------|------------|
| **Bombe** | Schwarz/rot, tickendes Warnsymbol | Falscher Buchstabe! Tippen = -30 Energie | 7% |
| **Eis** | Hellblau, Schneeflocken-Effekt | Verpasst = 3 Sek. Slow (für dich!) | 3% |

### Power-Ups (seltene Drops)

| Power-Up | Symbol | Effekt | Dauer |
|----------|--------|--------|-------|
| **Schild** | 🛡️ Blauer Kristall | Nächster Fehler kostet keine Energie | 1× Nutzung |
| **Zeitlupe** | ⏱️ Lila Kristall | Alle Kristalle fallen 50% langsamer | 5 Sekunden |
| **Magnet** | 🧲 Pinker Kristall | Sammelt ALLE Kristalle auf dem Schirm | Sofort |

---

## 3. Arcade Visual Design

### Hintergrund

- Animierter Sternenhimmel → **Parallax-Schichten** (3 Lagen die sich unterschiedlich schnell bewegen)
- Nebel-Effekte die langsam driften
- Bei Fieber: Hintergrund wechselt zu intensivem Violett/Pink mit Lichtstreifen

### Kristalle

- Echter 3D-Look mit Highlights und Schatten
- Konstantes sanftes Pulsieren (breathe-animation)
- Glitzer-Partikel die herunterfallen
- Bei Einsammeln: **Explosions-Ring** der nach außen expandiert

### UI im Arcade-Stil

- **Neon-Glow** auf allen Texten und Balken
- Score-Anzeige mit **LED-Segment-Font** (wie alte Spielautomaten)
- Combo-Anzeige: Große Zahlen die **ins Bild fliegen** und wieder verschwinden
- Energie-Balken mit **animiertem Farbverlauf** (grün→gelb→rot)

### Adaptive Screen-Effekte

```
Combo x1-x2:  Subtiel - kleine sparkles bij hit
Combo x3-x4:  Medium - screen pulse, grotere particles
Combo x5+:    Intensief - screen shake, light trails
Fieber:       MAXIMUM - alles beweegt, chromatic aberration, bass pulses
```

### Hit-Feedback

- Kristal explodeert in **20+ Partikel** in seiner Farbe
- **Freeze-Frame** (50ms) bei perfektem Timing
- Punkte fliegen vom Kristal zur Score-Anzeige
- **Shockwave-Ring** bei Gold/Regenboog Kristallen

---

## 4. Progression-System

### Score-basierte Sterne

```
⭐         = 5.000 Punkte   (machbar für jeden)
⭐⭐       = 15.000 Punkte  (gutes Spiel)
⭐⭐⭐     = 30.000 Punkte  (braucht Combos + Fieber)
```

### Highscore pro Level

- Persönlicher Rekord wird gespeichert
- Anzeige: "Dein Rekord: 24.350" vor Spielstart
- Nach dem Spiel: "NEUER REKORD!" mit Feuerwerk wenn übertroffen

### Edelsteine (Währung)

**Verdienen:**
- 1 Edelstein pro 1.000 Punkte im Spiel
- Bonus: +5 Edelsteine bei neuem Highscore
- Bonus: +10 Edelsteine bei 3-Sterne-Abschluss

### Shop-Items

| Kategorie | Items | Preis |
|-----------|-------|-------|
| **Kristall-Skins** | Diamant, Rubin, Smaragd, Herzen, Sterne, Pixel-Retro | 50-200 💎 |
| **Hintergründe** | Unterwasser, Weltraum, Vulkan, Regenbogen, Retro-Grid | 100-300 💎 |
| **Eric-Outfits** | Pirat, Astronaut, Zauberer, Superheld, Ninja | 150-400 💎 |
| **Trail-Effekte** | Feuer, Eis, Regenbogen, Pixel, Neon | 75-150 💎 |

---

## 5. Achievements

### Combo-Meister

| Achievement | Bedingung | Belohnung |
|-------------|-----------|-----------|
| Erste Schritte | 5er Combo | 10 💎 |
| Auf Touren | 10er Combo | 25 💎 |
| Unstoppbar | 20er Combo | 50 💎 |
| LEGENDE | 50er Combo | 200 💎 + "Legende" Titel |

### Fieber-Fan

| Achievement | Bedingung | Belohnung |
|-------------|-----------|-----------|
| Erste Hitze | Ersten Fieber-Modus erreichen | 15 💎 |
| Brennend heiß | 3× Fieber in einem Spiel | 75 💎 |
| Vulkan | 5× Fieber in einem Spiel | 150 💎 + Vulkan-Hintergrund |

### Präzision

| Achievement | Bedingung | Belohnung |
|-------------|-----------|-----------|
| Scharfschütze | Spiel ohne falsche Taste | 100 💎 |
| Perfektionist | 3 Spiele hintereinander ohne Fehler | 250 💎 + Gold-Kristall-Skin |

### Entdecker

| Achievement | Bedingung | Belohnung |
|-------------|-----------|-----------|
| Glückspilz | Ersten Regenbogen-Kristall fangen | 20 💎 |
| Bombenentschärfer | 10 Bomben erfolgreich vermieden | 50 💎 |
| Power-Sammler | Alle 3 Power-Up Typen in einem Spiel | 75 💎 |
| Magnet-Meister | 5+ Kristalle mit einem Magnet | 100 💎 |

### Meilensteine

| Achievement | Bedingung | Belohnung |
|-------------|-----------|-----------|
| Erstes Gold | 5.000 Punkte in einem Spiel | 15 💎 |
| Highflyer | 25.000 Punkte in einem Spiel | 100 💎 |
| Kristallkönig | 50.000 Punkte in einem Spiel | 300 💎 + Krone für Eric |
| Millionär | 1.000.000 Punkte total gesammelt | 500 💎 + Geheimer Titel |

---

## 6. Sound-Design

### Basis-Sounds

| Aktion | Sound-Typ |
|--------|-----------|
| Kristall gefangen | Heller "Pling!" - Tonhöhe steigt mit Combo |
| Falsche Taste | Dumpfes "Bonk" + kurzer Buzz |
| Kristall verpasst | Glas-Zerbrechen (sanft) |
| Bombe vermieden | Erleichtertes "Puh" + Entschärfungs-Click |
| Power-Up gefangen | Magischer Auflade-Sound |

### Combo-Sounds

```
x2 "Nice!"      → Freundlicher Jingle (aufsteigend)
x3 "Super!"     → Energischer Jingle + Crowd "Ooh!"
x4 "Awesome!"   → Epischer Hit + Crowd Applaus
x5 "MEGA!"      → BASS DROP + Crowd geht ab!
```

### Fieber-Modus Audio

- **Aufbau:** Herzschlag wird schneller wenn Balken voll wird
- **Start:** Explosions-Sound + "FIEBER!" Voice
- **Während:** Treibende Synthwave-Loop (8-bit Style)
- **Ende:** Abkühlungs-Sound, Musik faded aus

### Hintergrund-Musik

- Chilliger Lo-Fi Beat (nicht ablenkend)
- Intensität passt sich an Combo an (mehr Layers bei höherer Combo)
- Optional: Musik kann in Settings ausgeschaltet werden

---

## 7. Technische Architektur

### State-Struktur (Zustand Store)

```typescript
interface CrystalGameState {
  // Gameplay
  energy: number;           // 0-100
  score: number;
  combo: number;
  feverMeter: number;       // 0-100
  isFeverMode: boolean;
  feverTimeLeft: number;

  // Crystals
  crystals: CrystalData[];
  activePowerUp: PowerUp | null;

  // Progression
  highScore: number;
  totalGems: number;
  unlockedItems: string[];
  achievements: Achievement[];

  // Settings
  selectedSkin: string;
  selectedBackground: string;
  selectedEricOutfit: string;
  soundEnabled: boolean;
}
```

### Neue Componenten

```
src/components/game/
├── CrystalGame.tsx        # Hoofdcomponent (refactor)
├── Crystal.tsx            # Kristal met variants (refactor)
├── GameHUD.tsx            # NEW: Score, Energy, Combo, Fever UI
├── ComboPopup.tsx         # NEW: "MEGA!" animaties
├── FeverOverlay.tsx       # NEW: Fieber-modus effecten
├── PowerUpIndicator.tsx   # NEW: Actieve power-up display
├── GameOverScreen.tsx     # NEW: Score + achievements + retry
├── ArcadeBackground.tsx   # NEW: Parallax sterren + effecten
└── shop/
    ├── ShopModal.tsx      # NEW: Freischaltbares kaufen
    ├── SkinPreview.tsx    # NEW: Skin voorvertoning
    └── AchievementList.tsx # NEW: Achievement overzicht
```

### Neue lib Dateien

```
src/lib/
├── stores/
│   └── gameStore.ts       # NEW: Crystal Chaos state
├── data/
│   ├── achievements.ts    # NEW: Achievement definities
│   ├── shopItems.ts       # NEW: Shop items + prijzen
│   └── crystalTypes.ts    # NEW: Kristal variants
└── hooks/
    └── useGameSounds.ts   # NEW: Sound management
```

---

## 8. Implementatie-Volgorde

### Fase 1 - Core Refactor
- Energy-systeem
- Nieuw scoring met combo-multiplier
- Basis HUD met neon-styling

### Fase 2 - Fever Mode
- Fever-balk mechanisme
- Fever-modus activatie
- Visuele feedback (adaptive intensity)

### Fase 3 - Crystal Variants
- Gold + Regenboog kristallen
- Bommen + IJs kristallen
- Power-ups (Schild, Slow-mo, Magnet)

### Fase 4 - Juice & Polish
- Screen-shake, particles, freeze-frames
- Arcade-achtergrond met parallax
- Combo-popups die het scherm vullen

### Fase 5 - Progression
- Highscore systeem
- Gems + Shop
- Achievements

### Fase 6 - Sound
- Basis geluidseffecten
- Adaptive muziek
- Fieber-soundtrack

---

## Samenvatting

**Van simpel "30 kristallen vangen" naar:**

- ⚡ Energy-systeem met spanning en herstel
- 🔥 Combo-streaks (x1→x5) met visuele escalatie
- 💥 Fieber-modus voor maximale chaos
- 💎 6 kristal-types met unieke mechanics
- 🛡️ 3 power-ups voor strategische diepte
- 🏆 30+ achievements om te unlocken
- 🛒 Shop met skins, achtergronden, outfits
- 🎨 Vol arcade-gevoel met neon, particles, screen-shake
- 🎵 Adaptive audio die meegaat met de actie
