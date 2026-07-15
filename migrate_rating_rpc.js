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
    const query = `
      CREATE OR REPLACE FUNCTION get_average_ai_rating()
      RETURNS numeric AS $$
      DECLARE
        avg_val numeric;
      BEGIN
        SELECT ROUND(AVG(rating)::numeric, 1) INTO avg_val FROM public.ai_ratings;
        RETURN COALESCE(avg_val, 0.0);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    await client.query(query);
    console.log('Successfully updated get_average_ai_rating RPC to default to 0.0');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

run();
