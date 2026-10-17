import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const url =
  process.env.TURSO_DATABASE_URL ||
  process.env.turso_database_url ||
  process.env.DATABASE_URL ||
  'file:local.db';

const authToken =
  process.env.TURSO_AUTH_TOKEN ||
  process.env.turso_auth_token ||
  process.env.DATABASE_AUTH_TOKEN ||
  undefined;

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
export { schema, client };
