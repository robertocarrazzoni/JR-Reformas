import pg from "pg";

// Keep in sync with `tests/setup/env.ts`.
const TEST_DATABASE_URL =
  "postgresql://postgres:postgrespassword@localhost:5432/jr_reformas_test?schema=public";

const testDatabaseUrl = new URL(TEST_DATABASE_URL);
const databaseName = testDatabaseUrl.pathname.replace(/^\//, "");

async function main() {
  const client = new pg.Client({
    host: testDatabaseUrl.hostname,
    port: Number(testDatabaseUrl.port || 5432),
    user: decodeURIComponent(testDatabaseUrl.username),
    password: decodeURIComponent(testDatabaseUrl.password),
    database: "postgres",
 });

  await client.connect();

  try {
    const existing = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName],
    );

    if (existing.rowCount === 0) {
      const quotedName = `"${databaseName.replace(/"/g, '""')}"`;
      await client.query(`CREATE DATABASE ${quotedName}`);
      console.log(`Database "${databaseName}" criado para os testes.`);
    } else {
      console.log(`Database "${databaseName}" já existe.`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Falha ao preparar o database de testes:", error);
  process.exitCode = 1;
});
