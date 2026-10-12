import { createClient } from '@libsql/client/web';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log('Connecting to Turso DB via web/HTTP client:', url);

const client = createClient({
  url,
  authToken,
});

async function main() {
  try {
    const rs = await client.execute('SELECT 1 as connected;');
    console.log('✅ Connected to Turso DB successfully!', rs.rows);
  } catch (err) {
    console.error('❌ Turso connection error:', err);
  }
}

main();
