# Production deployment

Lettoria is deployed by Coolify at https://coolify.durchblick.nl/ on
`durchblick-1` (Tools / production, resource `durchblick-nl/typen-met-eric`).
The public site is https://lettoria.app/; existing `.nl` aliases remain supported.

## Git and build configuration

- Repository: `durchblick-nl/typen-met-eric`, branch `main`.
- Git source: the existing `durchblick-coolify` GitHub App.
- Auto deploy: deploy on push through GitHub webhooks.
- Build strategy: Railpack (migrated from deprecated Nixpacks on 2026-10-24).
- Site type: Dynamic, base directory `/`, publish directory `/out`.
- Install command: `npm ci`.
- Build command: `npm run build` (all four regional courses).
- Start command: `node node_modules/serve/build/main.js out -l 80`.
- Container port: `80`; healthcheck: `GET /` on port `80`.

The build must retain the combined `out/` export for NL (`/`), BE (`/be`),
DE (`/de`) and CH (`/ch`). Do not replace it with a single Next.js course build.

## Verification

A pushed commit is deployed only after Coolify reports a successful deployment
for that commit and the live site serves the expected content. Check the four
course roots, a lesson and privacy page, and referenced CSS/JavaScript assets.
The first Railpack deployment of commit `265d752` passed the container
healthcheck and served the updated referral privacy text on `lettoria.app`.

OpenPanel accepts `lettoria.app`, `www.lettoria.app`, `lettoria.nl` and
`www.lettoria.nl`. Analytics remains opt-in and records only the referring
origin; learner names, typing input and practice results stay local.
