import { query } from "../config/database.js";

async function setupStore() {
  console.log("Iniciando setup da loja (versão compatível)...");
  try {
    // 1. Adicionar colunas se não existirem
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS current_skin TEXT DEFAULT 'classic'
    `);
    console.log("Colunas 'coins' e 'current_skin' verificadas/adicionadas.");

    // 2. Criar tabela de inventário com tipo compatível (VARCHAR)
    await query(`
      CREATE TABLE IF NOT EXISTS user_inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        item_type TEXT NOT NULL, 
        item_id TEXT NOT NULL,
        purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(user_id, item_id)
      )
    `);
    console.log("Tabela 'user_inventory' criada com user_id VARCHAR.");

    console.log("Setup da loja concluído com sucesso!");
  } catch (error) {
    console.error("Erro no setup da loja:", error);
  }
}

setupStore();
