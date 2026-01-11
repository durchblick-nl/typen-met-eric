# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Typen met Eric** (Type with Eric) is a children's typing tutor PWA for ages 8-12. A young dragon named Eric guides children through learning to type while exploring the magical world of Lettoria. Each lesson restores magic to different regions of the world.

Primary language: Dutch (with German and English planned)

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion + Lottie
- **State:** Zustand
- **Auth/DB/Storage:** Supabase (Auth, PostgreSQL, Storage)
- **ORM:** Prisma (planned)
- **Email:** Resend (planned)
- **Hosting:** Cloudflare Pages
- **Repository:** GitHub

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run pages:build  # Build for Cloudflare Pages
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles with Tailwind
│   ├── kaart/              # World map page
│   ├── oefenen/            # Quick practice page
│   ├── les/[id]/           # Lesson pages
│   └── regio/[id]/         # Region detail pages
├── components/
│   ├── eric/Eric.tsx       # Eric character with mood animations
│   ├── keyboard/           # Virtual keyboard with finger guides
│   ├── map/WorldMap.tsx    # Interactive world map
│   └── typing/             # Typing exercise components
└── lib/
    ├── data/regions.ts     # Region and lesson definitions
    └── stores/             # Zustand state management
        ├── typingStore.ts  # Typing engine state
        └── progressStore.ts # Player progress persistence

public/images/
├── eric/                   # Eric character images (PNG)
│   ├── eric-happy.png
│   ├── eric-encouraging.png
│   ├── eric-thinking.png
│   ├── eric-celebrating.png
│   └── eric-worried.png
├── map/                    # World map assets (PNG)
│   ├── icon-grot.png       # Region icons
│   ├── icon-dorp.png
│   ├── icon-velden.png
│   ├── icon-woud.png
│   ├── icon-toppen.png
│   ├── icon-zee.png
│   ├── icon-kasteel.png
│   ├── deco-cloud.png      # Map decorations
│   └── deco-tree.png
└── posters/
    └── eric-hero.png       # Hero image
```

## Planning Documents

- `typen-met-eric-plan.md` - Complete project specification including database schema, UI designs, lesson structure
- `canva/` - Design assets and AI image prompts for Eric the dragon character

## Key Concepts

### World Structure (Lettoria)
The game world has 7 regions unlocked progressively:
1. Eric's Grot (Tutorial)
2. Het Startdorp (Home Row: ASDF JKL;)
3. De Velden (Top Row: QWERTYUIOP)
4. Het Fluisterwoud (Bottom Row: ZXCVBNM)
5. De Toppen (Numbers & Symbols)
6. De Zee (Speed Games)
7. Kasteel Compleet (Mastery)

### Eric the Dragon
- Grows with player progress (baby → teen → adult)
- Gains abilities: fire breathing at level 10, flying at level 20
- Colors: Emerald green (#2D7D46), gold accents (#FFD700), amber eyes (#FF6B35)
- 5 mood states: happy, encouraging, thinking, celebrating, worried
- Images stored as PNG in `public/images/eric/`

### Image Assets
- **Eric images**: PNG format with transparent backgrounds
- **Map icons**: High-resolution PNG icons for each region (`icon-*.png`)
- **Map decorations**: Cloud and tree decorations for visual polish
- **Region interface**: Uses optional `imageUrl` property for custom icons

### Gamification
- 6 gem types (one per region)
- 1-3 stars per lesson based on accuracy
- Daily streaks with rewards
- Achievements system

## Completed

- [x] Next.js 15 project with TypeScript and Tailwind CSS
- [x] Typing engine with WPM/accuracy tracking (Zustand store)
- [x] Virtual keyboard with finger position guides
- [x] Eric character component with 5 mood states
- [x] World map with 7 regions and animated paths
- [x] Story-driven lessons (Grot, Dorp, Velden regions)
- [x] Progress persistence with localStorage
- [x] Cloudflare Pages deployment (static export)
- [x] PNG image assets for Eric and map regions

## Next Steps

1. Set up Supabase project and configure environment variables
2. Implement Prisma schema from `typen-met-eric-plan.md` section 4.2
3. Add lessons for remaining regions (Woud, Toppen, Zee, Kasteel)
4. Implement user authentication and cloud progress sync
5. Add gamification features (gems, achievements, streaks)

## Deployment

- Push to GitHub triggers automatic deployment via Cloudflare Pages
- Build command: `npm run build`
- Output directory: `out`
- URL: https://typen-met-eric.pages.dev
