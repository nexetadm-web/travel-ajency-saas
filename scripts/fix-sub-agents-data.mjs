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
  // Sync commission_per_haji for existing records
  await client.execute(`
    UPDATE sub_agents
    SET commission_per_haji = CASE 
      WHEN commission_type = 'percent' THEN 0 
      ELSE commission_value 
    END
    WHERE commission_per_haji IS NULL OR commission_type = 'percent';
  `);

  await client.execute(`
    UPDATE sub_agents
    SET commission_value = 5000
    WHERE commission_value IS NULL;
  `);

  const res = await client.execute('SELECT id, name, city, commission_type, commission_value, commission_per_haji FROM sub_agents;');
  console.log('UPDATED SUB_AGENTS:', res.rows);
}

main().catch(console.error);
