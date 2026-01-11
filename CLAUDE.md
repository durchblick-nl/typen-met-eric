# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Typen met Eric** (Type with Eric) is a children's typing tutor PWA for ages 8-12. A young dragon named Eric guides children through learning to type while exploring the magical world of Lettoria. Each lesson restores magic to different regions of the world.

Primary language: Dutch (with German and English planned)

## Planned Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion + Lottie
- **State:** Zustand
- **Auth/DB/Storage:** Supabase (Auth, PostgreSQL, Storage)
- **ORM:** Prisma
- **Email:** Resend
- **Hosting:** Cloudflare Pages
- **Repository:** GitHub

## Project Status

Currently in planning phase. The repository contains:
- `typen-met-eric-plan.md` - Complete project specification including database schema, UI designs, lesson structure, and implementation roadmap
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

### Gamification
- 6 gem types (one per region)
- 1-3 stars per lesson based on accuracy
- Daily streaks with rewards
- Achievements system

## When Starting Development

The plan specifies this initial setup:
1. Create Next.js 14 project with TypeScript, Tailwind, App Router, src/ directory
2. Install: @supabase/supabase-js, @supabase/ssr, prisma, @prisma/client, framer-motion, zustand, zod
3. Install @cloudflare/next-on-pages for Cloudflare Pages deployment
4. Implement Prisma schema from `typen-met-eric-plan.md` section 4.2
5. Follow project structure in section 4.3

## Deployment

- Push to GitHub triggers automatic deployment via Cloudflare Pages
- Build command: `npx @cloudflare/next-on-pages`
- Use Cloudflare Pages Functions for API routes
