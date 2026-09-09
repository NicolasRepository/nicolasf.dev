# Site Pessoal — Portfólio + Preços + Captação de Leads

Frontend em React/Vite (Tailwind v4) + backend em Serverless Functions (Vercel) +
banco de dados PostgreSQL (Neon). Tudo no mesmo repositório, um único deploy na Vercel.

## Estrutura

```
├── src/                  → frontend (landing page, tabela de preços, formulário de contato)
├── api/
│   └── lead.ts           → POST /api/lead — rota que processa o formulário de contato
├── lib/
│   ├── validation.ts      → schema Zod
│   ├── db.ts              → cliente Neon + insert na tabela leads
│   ├── redis.ts           → rate limit (Upstash) — 3 envios / 10 min por IP
│   ├── turnstile.ts       → verificação anti-bot (Cloudflare Turnstile)
│   ├── email.ts           → notificação por e-mail (Resend)
│   ├── webhook.ts         → dispara payload para o Make.com
│   └── cors.ts            → CORS explícito (produção + localhost)
├── sql/schema.sql         → DDL para criar a tabela `leads` no Neon
├── .env.example           → variáveis de ambiente necessárias
└── vercel.json            → config de build/rewrite da Vercel
```

## Passo a passo do deploy

### 1. Banco de dados (Neon)

1. Crie um projeto em https://neon.tech (plano free serve bem).
2. Abra o **SQL Editor** do Neon e rode o conteúdo de `sql/schema.sql`.
3. Copie a **connection string** (aba "Connection Details", formato
   `postgres://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require`) —
   ela vai virar a env `DATABASE_URL`.

### 2. Anti-spam (Cloudflare Turnstile)

1. Acesse https://dash.cloudflare.com/ → Turnstile → **Add Site**.
2. Domínio: o seu domínio de produção (e pode adicionar `localhost` para testes).
3. Vai gerar duas chaves:
   - **Site Key** (pública) → `VITE_TURNSTILE_SITE_KEY`
   - **Secret Key** (privada) → `TURNSTILE_SECRET_KEY`

### 3. Rate limit (Upstash Redis)

1. Crie um banco em https://upstash.com/ (Redis, plano free).
2. Na aba **REST API**, copie `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.

### 4. E-mail (Resend)

1. Crie conta em https://resend.com/ e verifique um domínio (ou use o domínio de
   teste deles enquanto valida o seu).
2. Gere uma API Key → `RESEND_API_KEY`.
3. Defina `NOTIFICATION_EMAIL_FROM` (precisa ser do domínio verificado) e
   `NOTIFICATION_EMAIL_TO` (seu e-mail, para onde a notificação de cada lead chega).

### 5. Automação (Make.com)

1. Crie um cenário no Make.com iniciado por um módulo **Custom Webhook**.
2. Copie a URL gerada → `MAKE_WEBHOOK_URL`.
3. No mesmo cenário, adicione o módulo do Google Sheets para gravar cada lead recebido.

### 6. Deploy na Vercel

1. Suba este repositório no GitHub.
2. Em https://vercel.com/, clique em **Add New → Project** e importe o repositório
   (a Vercel detecta automaticamente o Vite para o frontend e o diretório `api/`
   para as Serverless Functions — nenhuma configuração extra é necessária além do
   `vercel.json` já incluso).
3. Em **Project Settings → Environment Variables**, cadastre TODAS as variáveis
   listadas em `.env.example` (backend e frontend).
   - `ALLOWED_ORIGIN` deve ser a URL final do seu site em produção
     (ex.: `https://seusite.vercel.app,https://www.seudominio.com`).
   - `VITE_API_BASE_URL` pode ficar vazio (o frontend chama `/api/lead` na mesma origem).
4. Faça o deploy. Depois de publicado, teste o formulário de contato de ponta a ponta.

## Desenvolvimento local

```bash
npm install
npm run dev
```

Para testar a rota da API localmente, use a CLI da Vercel (`vercel dev`), que
executa tanto o frontend quanto as funções em `api/` juntos, lendo as variáveis
de um arquivo `.env.local` (copie de `.env.example`).

```bash
npm i -g vercel
vercel dev
```

## Segurança — pontos já cobertos pelo código

- CORS explícito por domínio (`lib/cors.ts`).
- Rate limit de 3 envios / 10 min por IP (`lib/redis.ts`) → `429` quando excedido.
- Verificação Turnstile obrigatória no backend → `403` em caso de falha.
- Validação Zod de todo o `req.body` → `400` com lista de campos inválidos.
- Queries parametrizadas via driver do Neon (proteção contra SQL Injection).
- Nenhuma credencial hardcoded — tudo via `process.env`.
- Erros internos nunca expõem stack trace / detalhes do Postgres na resposta (`500` genérico).

## Integrações opcionais (Turnstile, Upstash, Resend, Make.com)

Apenas o **Neon (`DATABASE_URL`)** é obrigatório para o site funcionar. As demais
integrações são detectadas em tempo de execução: se a variável de ambiente
correspondente não estiver configurada, aquela etapa é **pulada automaticamente**
(sem erro, sem quebrar o envio do formulário) — só aparece um `console.warn` nos
logs da função na Vercel, avisando que está rodando em modo opcional:

| Variável ausente | O que acontece |
|---|---|
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Rate limit é pulado — qualquer volume de envios é aceito. |
| `TURNSTILE_SECRET_KEY` (backend) | Verificação anti-bot é pulada — token nem é exigido. |
| `VITE_TURNSTILE_SITE_KEY` (frontend) | O widget do Turnstile simplesmente não aparece no formulário. |
| `RESEND_API_KEY` / `NOTIFICATION_EMAIL_*` | Notificação por e-mail não é enviada. |
| `MAKE_WEBHOOK_URL` | Nada é disparado para o Make.com/Google Sheets. |

Isso é ótimo para testar rápido (só com Neon + Vercel), mas **em produção
recomenda-se configurar todas** — sem Turnstile e rate limit, o formulário fica
exposto a spam e bots; sem Resend/Make.com, você só vai ficar sabendo de novos
leads olhando a tabela `leads` direto no Neon.
