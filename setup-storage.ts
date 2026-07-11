import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('No DATABASE_URL');
    return;
  }

  const client = new Client({
    connectionString: dbUrl,
  });

  try {
    await client.connect();
    
    // Create policies for storage.objects for 'documents' bucket
    const queries = [
      `CREATE POLICY "Give public access to documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');`,
      `CREATE POLICY "Allow public uploads to documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');`,
      `CREATE POLICY "Allow public updates to documents" ON storage.objects FOR UPDATE USING (bucket_id = 'documents');`,
      `CREATE POLICY "Allow public deletes to documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents');`
    ];

    for (const q of queries) {
      try {
        await client.query(q);
        console.log('Executed:', q);
      } catch (e: any) {
        if (e.message.includes('already exists')) {
          console.log('Policy already exists:', q);
        } else {
          console.error('Error executing query:', e.message);
        }
      }
    }
  } catch (err) {
    console.error('Connection error', err);
  } finally {
    await client.end();
  }
}

main();
