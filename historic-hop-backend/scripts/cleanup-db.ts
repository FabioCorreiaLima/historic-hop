import { pool } from '../src/config/database.js';

async function cleanup() {
  console.log("🧹 Iniciando limpeza do banco de dados...");
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Lista de tabelas para deletar (exceto users)
    const tables = [
      'user_lesson_progress',
      'course_periods',
      'lessons',
      'courses',
      'activities',
      'historical_periods',
      'questions',
      'user_streaks',
      'ranking',
      'user_progress',
      'user_achievements'
    ];

    for (const table of tables) {
      console.log(`🗑️ Deletando tabela: ${table}`);
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }

    await client.query('COMMIT');
    console.log("✅ Limpeza concluída com sucesso! (Apenas a tabela 'users' foi mantida)");
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("❌ Erro durante a limpeza:", e);
  } finally {
    client.release();
    process.exit();
  }
}

cleanup();
