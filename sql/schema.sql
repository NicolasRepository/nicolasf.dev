-- Rode este script no console SQL do Neon (ou via psql/qualquer client Postgres)
-- para criar a estrutura necessária antes do primeiro deploy do backend.

CREATE TABLE IF NOT EXISTS leads (
    id          BIGSERIAL PRIMARY KEY,
    nome        TEXT NOT NULL,
    whatsapp    TEXT NOT NULL,
    email       TEXT NOT NULL,
    ramo        TEXT NOT NULL,
    tipo        TEXT NOT NULL CHECK (tipo IN ('empresa', 'agencia', 'outros')),
    ip          TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Acelera consultas por data (ex.: dashboards, exportações periódicas).
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);

-- Acelera buscas/deduplicação por e-mail.
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
