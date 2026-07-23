# Architecture

This project uses a lightweight layered architecture.

The goal is to keep routes, UI, business rules, and database access separate without over-engineering the codebase.

## Core Principles

- Server-first by default.
- Core functionality should work without browser JavaScript where possible.
- `app/` files are entry points for routes and actions.
- `components/` contains reusable UI components used across multiple features/pages.
- `features/` coordinates end-to-end user workflows.
- `domain/` contains business rules and domain types.
- `repositories/` contains database access.
- `lib/` contains shared setup and helper code.

---

## Folder Structure

```txt
src/
  app/
  components/
  features/
  domain/
  repositories/
  lib/
```

Each folder has a different responsibility.

---

## `app/`

Next.js routes, layouts, pages, and server actions.

Use `app/` for:
- Pages
- Layouts
- Server actions
- Reading route params and search params
- Redirects
- Calling feature functions
- Checking authentication for protected routes

For example, `src/app/admin/members/page.tsx` might:

1. Check that the user is an admin.
2. Read filters from the URL.
3. Call an admin members feature function.
4. Render the members table using feature/UI components.

---

## `components/`

Reusable UI components used across multiple features/pages.

Example:
```txt
src/components/
  layout/
    Container.tsx   
    Navbar.tsx
    Footer.tsx

  primitives/
    Button.tsx
```
Use components/layout/ for shared layout structure and components/primitives/ for small reusable UI building blocks.

Feature-specific components should usually live inside the relevant `features/` folder instead.

---

## `features/`

Use `features/` for workflow-specific code, such as:
- use-case functions which call domain and repository functions
- form parsing

Example:
```txt
src/features/
  membership-registration/
    submitMemberRegistration.ts
    parseRegistrationFormData.ts
```

---

## `domain/`

Business rules and domain types.

Examples:

```txt
src/domain/
  member/
    types.ts
    validation.ts
```

For example, the member domain should define the valid membership registration types, such as the conditional returning members, current UoA students, and non-current UoA students.

Domain code should not import from Next.js, React, Prisma, or repositories.

---

## `repositories/`

Database access.

Examples:

```txt
src/repositories/
  memberRepository.ts
```

Use `repositories/` for Prisma queries and database-specific functions such as `createMember` and `listMembers`.

Pages and server actions should call repository functions instead of importing Prisma directly.

---

## `lib/`

Shared setup and helper code.

Examples:

```txt
src/lib/
  db/
    prisma.ts
```

Use `lib/` for shared setup/helpers such as Prisma client setupb and generic utilities.

---

## Dependency Direction

A useful mental model:

```txt
app → features
features → domain
features → repositories
repositories → lib/db
repositories → domain
```

Repositories may use domain types as input/output types, but domain code must not depend on repositories.

---

## Example: Membership Registration

```txt
User submits form
  ↓
Server action receives FormData
  ↓
Server action calls registration feature
  ↓
Feature helper parses FormData into plain input
  ↓
Feature calls domain validation
  ↓
Feature calls repository with valid member
  ↓
Repository saves valid member to the database
```

## Example: Admin Members Page

```txt
Admin visits /admin/members
  ↓
Admin route checks the current session
  ↓
If the user is not an admin, redirect or block access
  ↓
Page reads filters from the URL
  ↓
Page calls admin members feature
  ↓
Feature parses and validates filters
  ↓
Feature calls repository
  ↓
Repository fetches filtered/paginated members from the database
  ↓
Feature/UI components render the filters and members table
```