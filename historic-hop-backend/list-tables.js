const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const r = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log(r.rows.map(t => t.table_name).join(', '));
  await pool.end();
}

check().catch(e => console.error(e.message));