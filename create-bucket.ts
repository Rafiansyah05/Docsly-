import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase.storage.createBucket('documents', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
  });

  if (error) {
    console.error('Error creating bucket:', error);
  } else {
    console.log('Bucket created successfully:', data);
  }
}

main();
