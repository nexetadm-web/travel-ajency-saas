import { createClient } from '@libsql/client/web';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO credentials in environment');
  process.exit(1);
}

const client = createClient({
  url,
  authToken,
});

const statements = [
  // Add columns to hotels table if missing
  `ALTER TABLE hotels ADD COLUMN name TEXT;`,
  `ALTER TABLE hotels ADD COLUMN type TEXT DEFAULT 'hotel_directory';`,
  `ALTER TABLE hotels ADD COLUMN price_per_night REAL DEFAULT 0;`,
  `ALTER TABLE hotels ADD COLUMN contact_person TEXT;`,

  // Create transports table if not exists
  `CREATE TABLE IF NOT EXISTS transports (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    type TEXT,
    route TEXT,
    cost REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS transports_agency_idx ON transports(agency_id);`
];

async function run() {
  console.log('Migrating hotels and transports columns/table to Turso...');
  for (const stmt of statements) {
    try {
      await client.execute(stmt);
      console.log('✓ Executed:', stmt.split('\n')[0].trim());
    } catch (e) {
      if (e.message && e.message.includes('duplicate column')) {
        console.log('ℹ Column already exists:', stmt.split('\n')[0].trim());
      } else {
        console.log('Notice:', stmt.split('\n')[0].trim(), '-', e.message);
      }
    }
  }
  console.log('✅ Hotels & Transports migration completed!');
}

run().catch(console.error);
