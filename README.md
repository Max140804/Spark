# SPARK

SPARK is a Next.js application for supplementary learning, with parent, pupil,
teacher, and administrator roles; PostgreSQL persistence; and LiveKit classroom
infrastructure.

## Local development

Requirements: Node.js 20+, Corepack, and PostgreSQL.

1. Copy `apps/web/.env.example` to `apps/web/.env` and set `DATABASE_URL`,
   `NEXTAUTH_URL`, and a unique `NEXTAUTH_SECRET`.
2. Install dependencies with `corepack pnpm install --frozen-lockfile`.
3. Generate the Prisma client and apply development migrations:
   `corepack pnpm db:generate` and `corepack pnpm db:migrate:dev`.
4. Configure SMTP to use account registration, email verification, and password
   reset.
5. Start the app with `corepack pnpm dev`.

The seed command is for development only. It refuses to run in production and
requires a `SEED_PASSWORD` of at least 12 characters.

## Production release checks

- Configure production PostgreSQL, HTTPS `NEXTAUTH_URL`, a random
  `NEXTAUTH_SECRET` of at least 32 characters, SMTP, and LiveKit credentials.
- Configure the trusted reverse proxy to provide an accurate client IP header;
  authentication and account endpoints use the database-backed rate limiter.
- For a **new, empty database**, apply migrations with `corepack pnpm db:migrate`.
  Existing databases must be backed up and carefully baselined against the
  migration history before deploying; do not apply the initial migration to an
  existing schema without that review.
- Run `corepack pnpm check:production-env`, `corepack pnpm lint`,
  `corepack pnpm test`, and `corepack pnpm build`.
- Deploy the generated Next.js app behind HTTPS and configure health monitoring
  against `/api/health`.

This repository does not include production credentials, a deployed database,
SMTP provider, LiveKit project, CI/CD deployment target, or completed legal
policies. Those must be supplied and verified before a production launch.
Self-service signup currently supports adult parent/guardian and teacher
accounts only; teacher accounts require approval. Pupil account creation and
enrolment, payments, file uploads, and reviewed privacy/terms pages are not yet
implemented.
