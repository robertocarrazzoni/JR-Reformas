# JR Santana — site e painel de agendamentos

Aplicação fullstack em Next.js (App Router) para o site institucional da JR
Santana, com cadastro de clientes, agendamento de visitas técnicas e painel
administrativo.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, `proxy.ts`) |
| Linguagem | TypeScript (strict) |
| Banco | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |
| Estilo | Tailwind CSS 4 |
| Validação | Zod (schemas compartilhados em `src/lib/schemas`) |
| Auth | JWT em cookie httpOnly (`jose`) + `bcryptjs` |
| E-mail | Resend |
| Testes | Jest + Postgres real (sem mocks do Prisma) |

## Estrutura

```
src/
  app/            rotas, páginas e route handlers
  components/     UI reutilizável
  lib/            utilidades, schemas, sessão, formatadores
  services/       ÚNICA camada que fala com o Prisma
  generated/      Prisma Client gerado (não versionado)
prisma/           schema, migrations e seed
tests/            testes de integração (services, rotas e proxy)
```

Regra de arquitetura: **nada fora de `src/services` importa `@/lib/prisma`**.
Server Components leem via service; Client Components mutam via API. A regra é
verificada por ESLint (`no-restricted-imports`).

## Setup local

Pré-requisitos: Node 20+, Docker (para o Postgres dos testes) e um Postgres
para desenvolvimento.

```bash
npm install                 # roda `prisma generate` no postinstall
cp .env.example .env        # preencha JWT_SECRET e NEXT_PUBLIC_APP_URL
npm run db:migrate          # aplica as migrations
npx prisma db seed          # cria admin e horários iniciais
npm run dev
```

### Variáveis de ambiente

| Variável | Obrigatória | Uso |
|---|---|---|
| `DATABASE_URL` | sim | conexão do Postgres (em produção, use a URL *pooled*) |
| `JWT_SECRET` | sim | assinatura dos JWTs de sessão e de reset |
| `NEXT_PUBLIC_APP_URL` | sim | base dos links de e-mail e metadata |
| `RESEND_API_KEY` | em produção | envio do e-mail de recuperação |
| `EMAIL_FROM` | não | remetente verificado no Resend |
| `EXPOSE_RESET_TOKEN` | **nunca em produção** | devolve o token de reset na resposta (só para testes locais) |

Sem `RESEND_API_KEY` a recuperação de senha responde 200 (para não revelar se a
conta existe), mas **não envia** o e-mail e registra um `console.error`.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` / `npm start` | build e execução de produção |
| `npm run lint` | ESLint (inclui a regra de acesso ao Prisma) |
| `npm test` | Jest (sobe o Docker e prepara o banco de teste) |
| `npm run db:migrate` | `prisma migrate dev` no banco de desenvolvimento |
| `npm run db:generate` | regenera o Prisma Client |
| `npm run db:studio` | Prisma Studio |

## Testes

Os testes de integração usam um Postgres real no Docker, não mocks do Prisma.

```bash
npm test
```

O `pretest` faz tudo automaticamente:

1. sobe o container de `docker-compose.yml`;
2. gera o Prisma Client;
3. cria o database `jr_reformas_test` se necessário;
4. aplica as migrations nesse database.

Os specs rodam em série (`maxWorkers: 1`) e truncam as tabelas antes de cada
caso. São mockados apenas `next/headers` (cookie store), `@/lib/mail` e
`@/lib/background` (para o `after()` rodar dentro do teste).

Cobertura funcional: cadastro/login/logout, perfil e senha, recuperação de senha
(token de uso único e revogação de sessão), rate limit, slots, agendamentos
(criação, cancelamento, status derivado), paginação do admin, serializers e
proxy de rotas.

## Segurança

- Senhas com `bcrypt` (10 rounds); nunca retornadas pela API.
- JWT em cookie `httpOnly`, `SameSite=Lax`, `Secure` em produção.
- Trocar/redefinir a senha grava `passwordChangedAt` e **revoga** tokens emitidos
  antes disso; o token de reset vale uma vez só.
- Rate limit em Postgres (`RateLimitCounter`): login 10/15 min por IP+e-mail,
  recuperação 5/15 min por IP e 3/15 min por e-mail. Responde `429` com
  `Retry-After`.
- Headers de segurança (CSP, HSTS em produção, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`) em `next.config.ts`.
- Recuperação de senha responde de forma neutra para não permitir enumeração de
  e-mails. O envio usa `after()` para não vazar tempo de resposta.

## Deploy na Vercel

1. Crie o Postgres pelo Marketplace (Neon/Supabase) e use a **connection string
   pooled** em `DATABASE_URL`.
2. Configure `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY` e
   `EMAIL_FROM`. Não configure `EXPOSE_RESET_TOKEN`.
3. O build roda `prisma generate` via `postinstall`. Aplique as migrations com
   `npx prisma migrate deploy` (localmente contra o banco de produção ou em um
   step do CI).

Limitações conhecidas:

- O rate limit é de janela fixa e grava uma linha por tentativa — adequado ao
  volume do site, não a tráfego de larga escala.
- O rate limit roda na aplicação (route handlers), não na borda: ele protege
  contas e caixas de e-mail, não a cota de invocações da plataforma.
- `Appointment_active_slot_key` é um índice único parcial criado só na migration
  (ver comentário no `schema.prisma`); recrie-o à mão após um `prisma db pull`.

## Identidade visual

Paleta preto/grafite + dourado + creme, tipografia Archivo (display) e Inter
(texto). Textos, contatos e placeholders da empresa ficam centralizados em
`src/lib/config.ts`.
