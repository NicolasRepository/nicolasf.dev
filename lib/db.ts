import { neon } from "@neondatabase/serverless";
import type { LeadInput } from "./validation.js";

/**
 * Cliente Neon (driver serverless via HTTP, ideal para Vercel Functions).
 * A connection string nunca deve ser exposta: vem estritamente de
 * process.env.DATABASE_URL (configurada no painel da Vercel / Neon).
 */
function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada");
  }
  return neon(connectionString);
}

export interface InsertedLead {
  id: number;
  created_at: string;
}

/**
 * Insere um novo lead na tabela `leads` usando query parametrizada
 * (o driver do Neon já faz o binding seguro dos parâmetros, mitigando
 * SQL Injection). Nunca fazer interpolação manual de string aqui.
 */
export async function insertLead(data: LeadInput & { ip: string }): Promise<InsertedLead> {
  const sql = getSql();

  const rows = await sql`
    INSERT INTO leads (nome, whatsapp, email, ramo, tipo, ip)
    VALUES (${data.nome}, ${data.whatsapp}, ${data.email}, ${data.ramo}, ${data.tipo}, ${data.ip})
    RETURNING id, created_at
  `;

  const row = rows[0] as { id: number; created_at: string } | undefined;
  if (!row) {
    throw new Error("Falha ao inserir lead: nenhuma linha retornada");
  }

  return row;
}
