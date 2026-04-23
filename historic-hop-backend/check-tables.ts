import { query } from './src/config/database.js';

async function checkTables() {
  try {
    const result = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', result.rows.map(t => t.table_name));
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}

checkTables();