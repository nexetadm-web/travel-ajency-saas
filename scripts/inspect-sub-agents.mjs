import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

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

async function main() {
  const cols = await client.execute('PRAGMA table_info(sub_agents);');
  console.log('SUB_AGENTS COLS:', cols.rows.map(r => r.name));
  const rows = await client.execute('SELECT * FROM sub_agents;');
  console.log('SUB_AGENTS ROWS:', rows.rows);
}

main().catch(console.error);
