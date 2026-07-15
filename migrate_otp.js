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
      CREATE TABLE IF NOT EXISTS public.otp_requests (
        email text PRIMARY KEY,
        otp varchar(6) NOT NULL,
        expires_at timestamptz NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `;
    
    await client.query(query);
    console.log('Successfully created otp_requests table');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

run();
