import { query } from "../config/database.js";

async function checkTypes() {
  const res = await query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users'
  `);
  console.log(JSON.stringify(res.rows, null, 2));
}

checkTypes();
