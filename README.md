# UoA Linux User Group Website

This repository contains the Web Development and Consulting Club (WDCC) project for the University of Auckland Linux User Group (LUG).

The project is a server-first web application for the club’s public website and administrative functionality. A core requirement of this project is that important functionality must continue to work even when browser JavaScript is disabled.

## Project goals

This project aims to provide:

- a public-facing website for the club
- a maintainable codebase for future contributors
- admin tooling for LUG executives
- a means for LUG executives to write blog posts and share news with members
- a server-rendered experience that does not rely on client-side JavaScript for core functionality

## Core constraints

These constraints should guide development decisions throughout the project:

- Core functionality must work when browser JavaScript is disabled.
- Use server-rendered components by default.
- At this stage, **do not add** `"use client"` at all.
- Client-side JavaScript should be treated as progressive enhancement, not a requirement.
- Simplicity, maintainability, and accessibility should be prioritised over unnecessary interactivity.

## Tech stack

Current stack:

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- ESLint
- Prettier
- pnpm
- Docker (for local database setup)

## Getting started

### Prerequisites

Make sure you have the following installed:

- Node.js 24.x
- pnpm 10.33.0
- Docker Desktop

This repository uses **pnpm** as its package manager.

- Use `pnpm` for dependency installation and scripts.
- Do not use `npm` or `yarn` in this repository.

### Windows note: line endings

If you are using Windows, configure Git to avoid checking files out with `CRLF` line endings, which can cause `pnpm format:check` / Prettier to fail on files you did not actually change.

Run this once before cloning the repository:

```bash
git config --global core.autocrlf input
```

This is mainly a Windows line-ending issue. The repository uses committed line-ending rules via `.gitattributes` and expects `LF` line endings.


### First-time local setup

1. Clone the repository.
2. Install dependencies:

```bash
pnpm install
```

3. Copy `.env.example` to `.env`.
4. Start Docker Desktop.
5. Start the local database:

```bash
pnpm db:up
```

6. Apply the existing migration history to your local database:

```bash
pnpm db:deploy
```

7. Generate the Prisma client:

```bash
pnpm db:generate
```

8. Start the development server:

```bash
pnpm dev
```

Then open the local development URL shown in the terminal.

### After pulling the latest changes

If you pull changes that affect the Prisma schema, migrations, or generated Prisma client, run:

```bash
pnpm db:deploy
pnpm db:generate
```

If you are unsure whether Prisma-related changes were pulled, it is safe to run both commands anyway.

## Environment variables

Local database development requires a `DATABASE_URL`.

See `docs/database.md` for the current database setup and workflow.

## High-level architecture

The application currently follows a server-first architecture using the Next.js App Router.

High-level principles:

- shared layout structure is defined in the root `layout.tsx`
- routes are server-rendered by default
- reusable layout and primitive components live under `src/components`
- core user flows should work with standard links, forms, and full page reloads
- browser JavaScript should only be introduced later if it provides a clear, non-essential enhancement

As the project evolves, more detailed architecture documentation will be added under the `docs/` directory.

## Repository structure

This repository currently follows a simple structure:

```text
src/
  app/
  components/
  lib/
public/
docs/
prisma/
```

This structure may evolve as the project grows.

## Contributing

Development should happen on feature branches and changes should be merged through pull requests.

Contribution guidelines and workflow conventions are documented in: `docs/CONTRIBUTING.md`.

## Staging and deployment

A Fly.io deployment pipeline has already been set up for staging.

This section will be expanded later with deployment workflow details.

## Team

| Name           | Role            |
| -------------- | --------------- |
| Amanda Yap    | Project Manager |
| William Tay     | Tech Lead       |
<<<<<<< HEAD
| Carl Dela Pena  | Designer + Developer  |
=======
| Vedanti Tewari  | Developer       |
| Carl Dela Pena  | Designer + Developer  |
| James Mullane    | Developer  |
| Riley Nicholls | Developer       |
| Sonja Li       | Developer       |
| Chuan Li       | Developer       |
| Finley Neilson | Software Dev    |
| Amin Farah     | Developer       |
| Samir Abbad    | Developer       |
>>>>>>> c451e0df8ac381fbd1f2f53728ffb99c9d85ede2
