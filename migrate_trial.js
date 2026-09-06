require('dotenv').config({path: 'apps/web/.env'});
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    
    await client.query(`
      create or replace function public.handle_new_user() 
      returns trigger as $$
      begin
        insert into public.profiles (id, email, nama_lengkap, avatar_url)
        values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
        
        insert into public.subscriptions (user_id, plan_type, status, berlaku_sampai)
        values (new.id, 'trial', 'active', now() + interval '7 days');
        
        return new;
      end;
      $$ language plpgsql security definer;
    `);
    
    console.log("Trigger handle_new_user updated for 7-day trial.");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await client.end();
  }
}

run();
