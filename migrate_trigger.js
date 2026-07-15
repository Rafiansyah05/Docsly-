const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, 'apps/web/.env') });
dotenv.config({ path: path.resolve(__dirname, 'apps/web/.env.local') });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres'
  });
  
  try {
    await client.connect();
    
    // Create the trigger for auth.users deletion
    const query = `
      CREATE OR REPLACE FUNCTION public.handle_deleted_profile()
      RETURNS trigger AS $$
      BEGIN
        DELETE FROM auth.users WHERE id = OLD.id;
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      DROP TRIGGER IF EXISTS on_profile_deleted ON public.profiles;
      CREATE TRIGGER on_profile_deleted
        AFTER DELETE ON public.profiles
        FOR EACH ROW EXECUTE PROCEDURE public.handle_deleted_profile();
    `;
    
    await client.query(query);
    console.log('Successfully created on_profile_deleted trigger');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

run();
