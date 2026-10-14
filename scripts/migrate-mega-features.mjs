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
  // 1. Columns for pilgrims table
  `ALTER TABLE pilgrims ADD COLUMN passport_scan_data TEXT;`,
  `ALTER TABLE pilgrims ADD COLUMN tracking_code TEXT;`,
  `ALTER TABLE pilgrims ADD COLUMN pnr TEXT;`,

  // 2. Columns for whatsapp_logs table
  `ALTER TABLE whatsapp_logs ADD COLUMN haji_id TEXT;`,
  `ALTER TABLE whatsapp_logs ADD COLUMN type TEXT;`,
  `ALTER TABLE whatsapp_logs ADD COLUMN sent_at TEXT DEFAULT CURRENT_TIMESTAMP;`,

  // 3. Sub agents commission column
  `ALTER TABLE sub_agents ADD COLUMN commission_per_haji REAL DEFAULT 5000;`,

  // 4. tracking_codes table
  `CREATE TABLE IF NOT EXISTS tracking_codes (
    id TEXT PRIMARY KEY,
    haji_id TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS tracking_codes_haji_idx ON tracking_codes(haji_id);`,
  `CREATE INDEX IF NOT EXISTS tracking_codes_code_idx ON tracking_codes(code);`,

  // 5. payments table
  `CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    haji_id TEXT NOT NULL,
    total_amount REAL NOT NULL DEFAULT 0,
    paid_amount REAL NOT NULL DEFAULT 0,
    remaining REAL NOT NULL DEFAULT 0,
    plan TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS payments_haji_idx ON payments(haji_id);`,

  // 6. installments table
  `CREATE TABLE IF NOT EXISTS installments (
    id TEXT PRIMARY KEY,
    haji_id TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    paid_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS installments_haji_idx ON installments(haji_id);`,

  // 7. sub_agent_earnings table
  `CREATE TABLE IF NOT EXISTS sub_agent_earnings (
    id TEXT PRIMARY KEY,
    sub_agent_id TEXT NOT NULL,
    haji_id TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 5000,
    paid INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS sub_agent_earnings_agent_idx ON sub_agent_earnings(sub_agent_id);`,
  `CREATE INDEX IF NOT EXISTS sub_agent_earnings_haji_idx ON sub_agent_earnings(haji_id);`,

  // 8. pnr_checks table
  `CREATE TABLE IF NOT EXISTS pnr_checks (
    id TEXT PRIMARY KEY,
    haji_id TEXT,
    pnr TEXT NOT NULL,
    airline TEXT,
    last_status TEXT,
    last_checked_at TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS pnr_checks_pnr_idx ON pnr_checks(pnr);`,

  // 9. group_expenses table
  `CREATE TABLE IF NOT EXISTS group_expenses (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    agency_id TEXT NOT NULL,
    ticket_cost REAL NOT NULL DEFAULT 0,
    hotel_cost REAL NOT NULL DEFAULT 0,
    visa_cost REAL NOT NULL DEFAULT 0,
    other_cost REAL NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS group_expenses_group_idx ON group_expenses(group_id);`,
  `CREATE INDEX IF NOT EXISTS group_expenses_agency_idx ON group_expenses(agency_id);`
];

async function run() {
  console.log('Running Phase 2 mega schema migration on Turso...');
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
  console.log('✅ Phase 2 Mega Features migration complete!');
}

run().catch(console.error);
