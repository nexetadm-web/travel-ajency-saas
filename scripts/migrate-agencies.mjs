import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const client = createClient({
  url: env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: env.TURSO_AUTH_TOKEN,
});

async function run() {
  const columnsToAdd = [
    { name: 'city', type: 'TEXT' },
    { name: 'status', type: "TEXT DEFAULT 'active'" },
    { name: 'plan', type: "TEXT DEFAULT 'starter'" },
    { name: 'monthly_fee', type: 'REAL DEFAULT 3000' },
    { name: 'last_login', type: 'TEXT' },
  ];

  for (const col of columnsToAdd) {
    try {
      await client.execute(`ALTER TABLE agencies ADD COLUMN ${col.name} ${col.type};`);
      console.log(`Added column ${col.name}`);
    } catch (e) {
      if (e.message && e.message.includes('duplicate column')) {
        console.log(`Column ${col.name} already exists`);
      } else {
        console.error(`Error adding ${col.name}:`, e.message);
      }
    }
  }

  // Ensure all existing agencies have status='active' if null
  await client.execute("UPDATE agencies SET status = 'active' WHERE status IS NULL;");
  await client.execute("UPDATE agencies SET plan = 'starter' WHERE plan IS NULL;");
  await client.execute("UPDATE agencies SET monthly_fee = 3000 WHERE monthly_fee IS NULL;");

  const tableInfo = await client.execute('PRAGMA table_info(agencies);');
  console.log('Updated columns:', tableInfo.rows.map(r => r.name));

  const all = await client.execute('SELECT id, name, email, status, plan, monthly_fee, role FROM agencies;');
  console.log('Agencies in DB:', all.rows);
}

run().catch(console.error);
