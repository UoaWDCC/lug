# Database workflow

## Stack

The project uses:

- **PostgreSQL** for the database
- **Prisma** as the ORM
- **Docker** for each developer’s local database setup

Production is intended to use plain PostgreSQL as well, so local development is designed to stay close to that setup.

## Local database setup

Each developer runs their **own local Postgres instance** using Docker.

This means:

- your local DB changes only affect your machine
- resetting your DB does not affect anyone else
- everyone can develop safely without sharing one mutable dev database

The local database is started through Docker Compose from the repo root.

## First-time local database setup

From the repository root:

1. Start Docker Desktop.
2. Copy `.env.example` to `.env`.
3. Start the local database:

```bash
pnpm db:up
```

4. Apply the existing migration history to your local database:

```bash
pnpm db:deploy
```

5. Generate Prisma Client:

```bash
pnpm db:generate
```

6. Seed the local database with example development data:

```bash
pnpm db:seed

At this point, your local database schema and generated Prisma client should match the current repository state.

## Prisma location

Prisma is kept at the **project root** in the standard location:

```text
prisma/
  schema.prisma
  migrations/
```

This is where:

- the Prisma schema lives
- migration history lives
- database structure changes are tracked

## Environment files

The repo includes a committed `.env.example` file and each developer creates their own local `.env`.

### `.env.example`

This is the template for required environment variables.

### `.env`

This is your actual local environment file and should **not** be committed.

For local development, `.env` will usually use the **same `DATABASE_URL` value** as `.env.example`, because each developer is connecting to their own local Postgres container, not a shared remote database.

Example:

```env
# Use this exact URL for local development. It points to your own local Postgres container, not a shared production database.
DATABASE_URL="postgresql://lug_user:lug_password@localhost:5432/lug_dev"
```

## Database scripts

Use the package scripts from the repo root rather than typing Docker/Prisma commands manually where possible.

- `pnpm db:up`  
  Starts the local Postgres container.

- `pnpm db:down`  
  Stops the local Postgres container without deleting its data.

- `pnpm db:status`  
  Shows whether the local DB container is running.

- `pnpm db:reset`  
  Deletes and recreates the local database volume. This wipes your local DB data and should only be used when you intentionally want a fresh local database.

- `pnpm db:generate`  
  Generates Prisma’s database client from the current schema into `src/generated/prisma`. Run this after schema changes when your app needs updated Prisma client code. In Prisma 7, this is no longer done automatically by `db:migrate`.

- `pnpm db:migrate --name <migration-name>`  
  Creates and applies a development migration from schema changes. This updates your local database schema and creates migration files, but in Prisma 7 it does **not** generate Prisma Client automatically.

  **Example:** `pnpm db:migrate --name add-admins`

- `pnpm db:deploy`  
  Applies existing migration files in the repository to your database. Use this when your local database needs to catch up to the repository's current schema, such as during first-time setup or after pulling migration changes from someone else.

- `pnpm db:studio`  
  Opens Prisma Studio to inspect the database in a browser.

- `pnpm db:seed`
  Inserts sample data into the local database. The seed is designed to be safe to run multiple times by updating existing seeded members based on their unique email addresses rather than creating duplicates.

## When to use each database command

### Normal local setup

Use these when setting up the project locally for the first time:

```bash
pnpm db:up
pnpm db:deploy
pnpm db:generate
pnpm db:seed
```

### After pulling database-related changes

If you pull changes that affect the Prisma schema, migrations, or generated Prisma client, run:

```bash
pnpm db:deploy
pnpm db:generate
```

### When changing the schema yourself

If you are intentionally changing the database schema:

1. update `prisma/schema.prisma`
2. run:

```bash
pnpm db:migrate --name <migration-name>
pnpm db:generate
```

`db:migrate` creates/applies the migration. In Prisma 7, it does **not** run `prisma generate` automatically, so `db:generate` must be run explicitly.

## Generated Prisma client

This project uses Prisma 7’s `prisma-client` generator with a custom output path under `src/generated/prisma`.

That generated client is:

- required for app code, type checking, and builds
- generated locally with `pnpm db:generate`
- not committed to git

Because Prisma 7 no longer runs `prisma generate` automatically from `migrate dev`, developers need to run `pnpm db:generate` explicitly after schema changes and after pulling Prisma-related changes.

## Per-developer local databases
Every developer has their **own local database**.

That is an intentional part of the workflow.

It means:
- you can experiment safely
- your reset commands only affect your own machine
- no one accidentally corrupts a shared dev DB

Schema consistency is handled through **migrations committed to git**, not through everyone sharing one local database.

## Schema changes and migrations
Schema changes must go through **Prisma schema changes plus migrations**.

The expected workflow is:

1. update `prisma/schema.prisma`
2. run `pnpm db:migrate --name <migration-name>`
3. run `pnpm db:generate`
4. commit the schema change and migration files
5. open a PR
6. other developers pull the changes, apply the migrations locally, and run `pnpm db:generate`

This is important because it keeps database structure:
- version-controlled
- reviewable
- reproducible across the team

For normal schema changes, do not manually write `CREATE TABLE` or `ALTER TABLE` statements as the official workflow. 

Instead, update `prisma/schema.prisma` and generate a migration with `pnpm db:migrate --name <migration-name>`. This keeps schema changes version-controlled and reproducible across the team.