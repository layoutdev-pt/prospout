
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
import 'dotenv/config';

const privateSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function setupDatabase() {
  console.log('Starting database setup...');

  const { error: companiesError } = await privateSupabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS companies (
          id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          website TEXT
      );
    `
  });

  if (companiesError) {
    console.error('Error creating "companies" table:', companiesError.message);
  } else {
    console.log('"companies" table created or already exists.');
  }

  const { error: influencersError } = await privateSupabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS influencers (
          id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
          name TEXT NOT NULL,
          instagram_handle TEXT UNIQUE,
          followers INTEGER,
          email TEXT UNIQUE
      );
    `
  });

  if (influencersError) {
    console.error('Error creating "influencers" table:', influencersError.message);
  } else {
    console.log('"influencers" table created or already exists.');
  }

  console.log('Database setup complete.');
}

setupDatabase();
