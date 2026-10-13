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
  // Add sub_agent_id to pilgrims if not exists
  `ALTER TABLE pilgrims ADD COLUMN sub_agent_id TEXT;`,

  // 1. installment_plans
  `CREATE TABLE IF NOT EXISTS installment_plans (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    pilgrim_id TEXT NOT NULL,
    group_id TEXT,
    total_amount REAL NOT NULL,
    advance_paid REAL DEFAULT 0,
    installments_count INTEGER NOT NULL,
    per_installment REAL NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS installment_plans_agency_idx ON installment_plans(agency_id);`,
  `CREATE INDEX IF NOT EXISTS installment_plans_pilgrim_idx ON installment_plans(pilgrim_id);`,

  // 2. installment_payments
  `CREATE TABLE IF NOT EXISTS installment_payments (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    agency_id TEXT NOT NULL,
    due_date TEXT NOT NULL,
    paid_date TEXT,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    method TEXT,
    receipt_no TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS installment_payments_plan_idx ON installment_payments(plan_id);`,
  `CREATE INDEX IF NOT EXISTS installment_payments_agency_idx ON installment_payments(agency_id);`,

  // 3. sub_agents
  `CREATE TABLE IF NOT EXISTS sub_agents (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    cnic TEXT,
    city TEXT,
    commission_type TEXT DEFAULT 'per_person',
    commission_value REAL DEFAULT 5000,
    total_pilgrims INTEGER DEFAULT 0,
    total_earned REAL DEFAULT 0,
    total_paid REAL DEFAULT 0,
    remaining REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS sub_agents_agency_idx ON sub_agents(agency_id);`,

  // 4. inventory_items
  `CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    purchase_price REAL,
    stock_qty INTEGER DEFAULT 0,
    issued_qty INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS inventory_items_agency_idx ON inventory_items(agency_id);`,

  // 5. inventory_issues
  `CREATE TABLE IF NOT EXISTS inventory_issues (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    group_id TEXT,
    pilgrim_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    issued_date TEXT DEFAULT CURRENT_TIMESTAMP,
    returned INTEGER DEFAULT 0
  );`,
  `CREATE INDEX IF NOT EXISTS inventory_issues_agency_idx ON inventory_issues(agency_id);`,
  `CREATE INDEX IF NOT EXISTS inventory_issues_pilgrim_idx ON inventory_issues(pilgrim_id);`,
  `CREATE INDEX IF NOT EXISTS inventory_issues_item_idx ON inventory_issues(item_id);`
];

async function migrate() {
  console.log('Migrating closer tables to Turso DB...');
  for (const sql of statements) {
    try {
      await client.execute(sql);
      console.log('✓ Executed:', sql.split('\n')[0].trim());
    } catch (e) {
      if (e.message && e.message.includes('duplicate column')) {
        console.log('ℹ Column already exists:', sql.split('\n')[0].trim());
      } else {
        console.log('Notice:', sql.split('\n')[0].trim(), '-', e.message);
      }
    }
  }
  console.log('✅ Closer tables migration complete!');
}

migrate().catch(console.error);
