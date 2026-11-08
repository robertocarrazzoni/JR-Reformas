// This file runs before any test module is imported (see `setupFiles` in jest.config.ts).
// It must define DATABASE_URL before `src/lib/prisma.ts` is loaded, otherwise the tests
// would connect to the development database configured in .env.
process.env.DATABASE_URL =
  "postgresql://postgres:postgrespassword@localhost:5432/jr_reformas_test?schema=public";
process.env.JWT_SECRET = "test-secret";
