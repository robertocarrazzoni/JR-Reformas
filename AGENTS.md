<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repository Guidelines

## Project Structure & Module Organization

This repository hosts a fullstack Next.js app for JR Reformas. Keep application code under `src/` using the App Router:

- `src/app/`: pages, layouts, route handlers, and API routes.
- `src/components/`: reusable UI components.
- `src/lib/`: utilities, auth helpers, Prisma client, and Zod schemas.
- `prisma/`: `schema.prisma`, migrations, and seed scripts.
- `tests/`: end-to-end API tests.
- `public/`: static assets.

Keep shared validation schemas in `src/lib/schemas/`.

## Build, Test, and Development Commands

Use `npm` as the package manager.

- `npm run dev` starts the local Next.js development server.
- `npm run build` creates a production build.
- `npm run start` runs the built app.
- `npm test` runs the Jest test suite.
- `npm run lint` checks code style and common issues.
- `npx prisma migrate dev` applies local database migrations.
- `npx prisma db seed` creates initial admin and slot data.

## Coding Style & Naming Conventions

Use TypeScript throughout. Prefer explicit types at API, Prisma, and auth boundaries. Use 2-space indentation and descriptive names.

Use PascalCase for React components, camelCase for variables/functions, and kebab-case for route segments. Name Zod schemas with a `Schema` suffix, such as `createAppointmentSchema`.

Run linting before submitting changes. Do not duplicate validation logic between frontend and backend.

## Testing Guidelines

Tests should verify behavior end to end through API flows using Jest. Place tests in `tests/` and name files with `.spec.ts`.

Cover customer registration/login, slot listing, appointment creation, valid cancellation, late-cancellation rejection, admin slot management, and protected-route access.

Use an isolated test database and reset data between tests.

## Commit & Pull Request Guidelines

Git history is minimal and has no strict convention. Use short, imperative commit messages, for example `Add appointment cancellation flow`.

Pull requests should include a summary, test results, migration notes for Prisma changes, and screenshots for UI changes. Link related issues when available.

## Security & Configuration Tips

Never commit secrets. Store database and auth settings in `.env`, including `DATABASE_URL` and session secrets. Hash passwords, restrict admin routes by role, and validate request bodies with Zod before touching Prisma.
