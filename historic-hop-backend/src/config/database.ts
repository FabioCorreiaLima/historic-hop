import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export { pool };
export let dbConnected = false;

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada:', { duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Erro na query:', err);
    throw err;
  }
}

export async function initDatabase() {
  try {
    await query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await query('SELECT 1');
    dbConnected = true;

    // 1. Tabela de Usuários
    await query(`CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        name VARCHAR(255),
        avatar TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. Tabela de Conquistas
    await query(`CREATE TABLE IF NOT EXISTS user_achievements (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" VARCHAR(255) NOT NULL,
        achievement_key TEXT NOT NULL,
        "unlockedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("userId", achievement_key),
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
    )`);

    // 3. Tabela de Progresso (NOVA)
    await query(`CREATE TABLE IF NOT EXISTS user_progress (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(255) NOT NULL,
        level INTEGER NOT NULL,
        score INTEGER DEFAULT 0,
        stars INTEGER DEFAULT 0,
        percentage INTEGER DEFAULT 0,
        max_combo INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, level),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // 4. Tabela de Ranking (NOVA)
    await query(`CREATE TABLE IF NOT EXISTS ranking (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(255) NOT NULL UNIQUE,
        total_score INTEGER DEFAULT 0,
        weekly_score INTEGER DEFAULT 0,
        max_level INTEGER DEFAULT 0,
        weekly_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // 5. Tabela de Streaks (NOVA)
    await query(`CREATE TABLE IF NOT EXISTS user_streaks (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(255) NOT NULL UNIQUE,
        current_streak INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        last_practice_date DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // 6. Tabela de Perguntas (AdminPanel)
    await query(`CREATE TABLE IF NOT EXISTS questions (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        level INTEGER DEFAULT 1,
        difficulty VARCHAR(255) DEFAULT 'Fácil',
        topic VARCHAR(255),
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_index INTEGER NOT NULL,
        explanation TEXT,
        media_type VARCHAR(50) DEFAULT 'text',
        image_url TEXT,
        audio_url TEXT,
        video_url TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // 7. Tabela de Atividades
    await query(`CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        type VARCHAR(255) NOT NULL,
        "periodId" VARCHAR(255) NOT NULL,
        level INTEGER DEFAULT 1,
        difficulty VARCHAR(255) DEFAULT 'Fácil',
        content TEXT NOT NULL,
        "imageUrl" TEXT,
        "mapUrl" TEXT,
        "audioUrl" TEXT,
        "videoUrl" TEXT,
        "avatarUrl" TEXT,
        "isAIGenerated" BOOLEAN DEFAULT TRUE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // 8. Tabela de Períodos Históricos (Dinamismo do Mapa)
    await query(`CREATE TABLE IF NOT EXISTS historical_periods (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        emoji VARCHAR(255),
        years VARCHAR(255),
        color VARCHAR(255),
        bgColor VARCHAR(255),
        borderColor VARCHAR(255),
        description TEXT,
        characterName VARCHAR(255),
        characterEmoji VARCHAR(255),
        order_index INTEGER DEFAULT 0,
        image_url TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Garantir que a coluna order_index e image_url existem (migração)
    try {
      await query(`ALTER TABLE historical_periods ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0`);
      await query(`ALTER TABLE historical_periods ADD COLUMN IF NOT EXISTS image_url TEXT`);
    } catch (e) {
      console.log('Coluna order_index já existe ou erro ao adicionar.');
    }

    await seedHistoricalPeriods();

    console.log('✅ Todas as tabelas foram inicializadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    dbConnected = false;
  }
}

async function seedHistoricalPeriods() {
  const periods = [
    {
      id: "colonia",
      name: "Brasil Colônia",
      emoji: "⛵",
      years: "1500–1822",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-300",
      description: "Chegada dos portugueses, escravidão, ciclos econômicos",
      characterName: "Padre Manoel",
      characterEmoji: "⛪",
      order_index: 10,
    },
    {
      id: "imperio",
      name: "Império do Brasil",
      emoji: "👑",
      years: "1822–1889",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      description: "Independência, D. Pedro I e II, Abolição da Escravidão",
      characterName: "Imperador Pedro",
      characterEmoji: "👑",
      order_index: 20,
    },
    {
      id: "republica_velha",
      name: "República Velha",
      emoji: "☕",
      years: "1889–1930",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-300",
      description: "Política do café com leite, coronelismo, revoltas",
      characterName: "Coronel Silva",
      characterEmoji: "🎩",
      order_index: 30,
    },
    {
      id: "era_vargas",
      name: "Era Vargas",
      emoji: "🏭",
      years: "1930–1945",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      description: "Getúlio Vargas, CLT, Estado Novo, industrialização",
      characterName: "Operário João",
      characterEmoji: "🔧",
      order_index: 40,
    },
    {
      id: "ditadura",
      name: "Ditadura Militar",
      emoji: "✊",
      years: "1964–1985",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      description: "Golpe militar, AI-5, resistência, redemocratização",
      characterName: "Estudante Maria",
      characterEmoji: "📢",
      order_index: 50,
    },
    {
      id: "nova_republica",
      name: "Nova República",
      emoji: "🗳️",
      years: "1985–presente",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      description: "Constituição de 88, Plano Real, democracia",
      characterName: "Cidadão Carlos",
      characterEmoji: "🗳️",
      order_index: 60,
    },
  ];

  for (const p of periods) {
    await query(
      `INSERT INTO historical_periods 
      (id, name, emoji, years, color, bgColor, borderColor, description, characterName, characterEmoji, order_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, emoji = EXCLUDED.emoji, years = EXCLUDED.years,
      color = EXCLUDED.color, bgColor = EXCLUDED.bgColor, borderColor = EXCLUDED.borderColor,
      description = EXCLUDED.description, characterName = EXCLUDED.characterName, 
      characterEmoji = EXCLUDED.characterEmoji, order_index = EXCLUDED.order_index`,
      [p.id, p.name, p.emoji, p.years, p.color, p.bgColor, p.borderColor, p.description, p.characterName, p.characterEmoji, p.order_index]
    );
  }
}