require('dotenv').config({path: 'apps/web/.env'});
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    
    // Create the user_limits table
    await client.query(`
      create table if not exists user_limits (
        user_id uuid references auth.users(id) primary key,
        ai_credits_used integer default 0,
        ai_limit_reset_at timestamptz,
        citations_used integer default 0,
        citations_limit_reset_at timestamptz,
        storage_used_bytes bigint default 0
      );
    `);
    
    console.log("Table user_limits created/verified.");
    
    // Attempt to enable RLS (might fail if already enabled, but usually safe)
    await client.query(`alter table user_limits enable row level security;`);
    
    // Adding policies so users can read their own limits (optional but good practice)
    await client.query(`
      do $$
      begin
        if not exists (select 1 from pg_policies where policyname = 'Users can view their own limits') then
          create policy "Users can view their own limits" on user_limits
            for select using (auth.uid() = user_id);
        end if;
      end
      $$;
    `);
    
    console.log("RLS enabled and policies created.");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await client.end();
  }
}

run();
