import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Bootstrap do administrador.
 *
 * Idempotente de propósito: pode rodar a cada deploy sem duplicar usuário e
 * sem sobrescrever a senha já trocada em /admin/conta. Por isso o passwordHash
 * só é gravado na criação — nunca no update.
 */
const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;
const ADMIN_NAME = "Administrador";

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} não definida.`);
  }

  return value;
}

async function main() {
  // Tarefa administrativa: usa a conexão direta (sem PgBouncer) quando existir,
  // como nas migrations. O app em si continua usando DATABASE_URL (pooled).
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED?.trim() || requireEnv("DATABASE_URL");
  const email = requireEnv("ADMIN_EMAIL");
  const password = requireEnv("ADMIN_PASSWORD");

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    if (existing) {
      if (existing.role !== "ADMIN") {
        console.warn(
          `Aviso: ${email} já existe como ${existing.role} e será promovido a ADMIN.`,
        );
      }

      // Mantém a senha atual. Promover o role conserta um rebaixamento
      // acidental sem revogar a sessão de quem já está logado.
      await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });

      console.log(`Admin já existente: ${email} (senha preservada).`);
      return;
    }

    await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        email,
        passwordHash: await hash(password, BCRYPT_ROUNDS),
        role: "ADMIN",
      },
    });

    console.log(`Admin criado: ${email}. Troque a senha em /admin/conta.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Falha ao executar o seed:", error);
  process.exitCode = 1;
});
