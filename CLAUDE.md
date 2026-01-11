# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lettoria** is a free children's typing tutor PWA for ages 8-12. A young dragon named Eric guides children through learning to type while exploring the magical world of Lettoria. Each lesson restores magic to different regions of the world.

- **Domain:** https://lettoria.nl
- **Primary language:** Dutch (with German and English planned)
- **Price:** 100% Free, no registration required, no data collection

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State:** Zustand
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
│   ├── layout.tsx          # Root layout with SEO meta tags
│   ├── page.tsx            # Landing page (marketing)
│   ├── globals.css         # Global styles with Tailwind
│   ├── robots.ts           # SEO robots.txt
│   ├── sitemap.ts          # SEO sitemap.xml
│   ├── kaart/              # World map page
│   ├── oefenen/            # Quick practice page
│   ├── over/               # About page (for parents)
│   ├── impressum/          # Legal/colofon page
│   ├── les/[lessonId]/     # Lesson pages
│   └── regio/[regionId]/   # Region detail pages
├── components/
│   ├── eric/Eric.tsx       # Eric character with mood animations
│   ├── keyboard/           # Virtual keyboard with finger guides
│   ├── map/WorldMap.tsx    # Interactive world map
│   ├── typing/             # Typing exercise components
│   ├── ui/Sparkles.tsx     # Animated sparkles effect
│   └── Footer.tsx          # Shared footer component
└── lib/
    ├── data/regions.ts     # Region and lesson definitions (23 lessons)
    └── stores/             # Zustand state management
        ├── typingStore.ts  # Typing engine state
        └── progressStore.ts # Player progress persistence

scripts/
└── generate-images.ts      # Imagen 3 image generation script

public/images/
├── eric/                   # Eric character images (PNG, optimized)
├── map/                    # World map assets (PNG)
├── stories/                # Story illustrations per lesson
└── posters/                # Marketing images
```

## Key Concepts

### World Structure (Lettoria)
The game world has 7 regions with 23 lessons total:
1. **Eric's Grot** (1 lesson) - Tutorial, F and J keys
2. **Het Startdorp** (5 lessons) - Home Row: ASDF JKL;
3. **De Velden** (2 lessons) - Top Row: E, I, R, U
4. **Het Fluisterwoud** (4 lessons) - Bottom Row: ZXCVBNM
5. **De Toppen** (4 lessons) - Numbers: 1234567890
6. **De Zee** (4 lessons) - Speed challenges
7. **Kasteel Compleet** (3 lessons) - Mastery tests

### Eric the Dragon
- 5 mood states: happy, encouraging, thinking, celebrating, worried
- Growth stages: baby, teen, adult (images available)
- Colors: Emerald green (#2D7D46), gold accents (#FFD700)
- Images stored as optimized PNG in `public/images/eric/`

### Privacy First
- No registration required
- No email collection
- No tracking or analytics
- Progress stored locally in browser (localStorage)
- No personal data ever transmitted

### SEO
- Full meta tags (Open Graph, Twitter Cards)
- JSON-LD structured data (WebApplication, Course)
- Dynamic sitemap.xml and robots.txt
- Canonical URL: https://lettoria.nl

## Completed

- [x] Next.js 15 project with TypeScript and Tailwind CSS
- [x] Typing engine with WPM/accuracy tracking
- [x] Virtual keyboard with finger position guides
- [x] Eric character component with 5 mood states
- [x] World map with 7 regions and animated paths
- [x] All 23 lessons with stories and images
- [x] Progress persistence with localStorage
- [x] Cloudflare Pages deployment
- [x] SEO optimization (meta tags, JSON-LD, sitemap)
- [x] Marketing homepage with animations
- [x] About page for parents (/over)
- [x] Legal/impressum page (/impressum)
- [x] Image optimization (compressed PNGs)

## Next Steps

1. Add gamification features (gems, achievements, streaks)
2. Implement certificate/diploma generation
3. Add sound effects and background music (optional)
4. Multi-language support (German, English)
5. PWA offline support with service worker

## Deployment

- Push to GitHub triggers automatic deployment via Cloudflare Pages
- Build command: `npm run build`
- Output directory: `out`
- Production URL: https://lettoria.nl
- Staging URL: https://typen-met-eric.pages.dev

## Image Generation

Use `scripts/generate-images.ts` with Google Imagen 3:
```bash
GEMINI_API_KEY=xxx npx ts-node scripts/generate-images.ts --generate
```
