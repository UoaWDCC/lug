# How to contribute!

There are some basic guidelines to be adhered to when contributing to this project. Please read the following sections carefully.

## Core rules

- Do not work directly on `main`.
- At this stage, do **not** add `"use client"`.
- Build server-first. Core functionality must still work when browser JavaScript is disabled.
- Keep changes focused and easy to review.

## Branches, commits, and pull requests

All changes should go through a pull request.

We use **Squash and merge**, so your pull request should represent one clear piece of work.

### Branch names

Branches follow one of the 2 formats below, where `type` matches one of the conventional commit types listed in the **Commit messages** section below.

- With an issue number: `<type>/<issue-number>-<short-description>`
- Without an issue number: `<type>/<short-description>`

Examples:

```text
feat/12-add-login
fix/25-navbar-bug
chore/update-readme
```

### Commit messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

Write the description in the **imperative mood**.

- Use: `add login form`
- Not: `added login form`


**Example types :**

| Type       | Use for                                  |
| ---------- | ---------------------------------------- |
| `feat`     | New user-facing functionality            |
| `fix`      | Bug fix                                  |
| `docs`     | Documentation only                       |
| `style`    | Formatting, whitespace — no logic change |
| `refactor` | Restructure with no behaviour change     |
| `perf`     | Performance improvement                  |
| `test`     | Adding or correcting tests               |
| `chore`    | Tooling, dependencies, config            |
| `ci`       | CI/CD pipeline changes                   |
| `build`    | Build system changes                     |
| `revert`   | Reverts a previous commit                |



Format:

```text
type(scope): short description
```

Examples:

```text
feat(login): add login form
fix(navbar): fix navbar alignment on mobile
chore(tooling): add husky pre-commit hook
docs(readme): improve setup instructions
```

### Pull request titles

Since pull requests are squash-merged, PR titles will resemble commit messages. They make it clear what work was done in the pull request.

Format:

```text
type(scope): short clear description
```

Examples:

```text
feat(login): add login functionality
fix(navbar): fix navbar alignment on mobile
```

For tips on writing a good PR:
[Atlassian's Guide to Pull Requests](https://www.atlassian.com/blog/git/written-unwritten-guide-pull-requests)

## Checks and formatting

This project uses:

- **Prettier** for formatting
- **ESLint** for linting
- **TypeScript** for type checking

### Useful commands:

| Command | What it does |
|---|---|
| `pnpm lint` | Runs ESLint across the project. |
| `pnpm lint:fix` | Automatically fixes ESLint issues where possible. |
| `pnpm typecheck` | Runs the TypeScript checker without generating output files. |
| `pnpm format` | Runs Prettier across the repository and rewrites files. Use intentionally. |
| `pnpm format:check` | Checks whether files match the expected Prettier formatting without modifying them. |
| `pnpm build` | Builds the application for production. |
| `pnpm check` | Runs the standard pre-PR checks: Prisma client generation, lint, typecheck, format check, and build. |

### Pre-commit hook

This repository uses **Husky** and **lint-staged**.

When you commit, the pre-commit hook automatically runs linting and formatting on the files that are staged for that commit.

This only checks **staged files**. Before opening a pull request, still run the full project checks.

## Before opening a pull request

Run:

```bash
pnpm check
```

Also make sure:

- the app still runs locally with `pnpm dev`
- the PR only contains relevant changes
- the PR title is clear and follows the required format
- the PR description explains what changed and why

## Documentation

If your change affects setup, workflow, architecture, or the database, update the relevant docs in the same pull request.
