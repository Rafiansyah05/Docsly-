const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, 'apps/web/.env') });
dotenv.config({ path: path.resolve(__dirname, 'apps/web/.env.local') });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    const res = await client.query(`
      SELECT * FROM pg_policies WHERE tablename = 'ai_ratings';
    `);
    console.log(res.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

run();
