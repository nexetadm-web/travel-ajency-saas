import { createClient } from '@libsql/client/web';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

const statements = [
  // 1. agencies
  `CREATE TABLE IF NOT EXISTS agencies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    logo_url TEXT,
    address TEXT,
    license_no TEXT,
    role TEXT NOT NULL DEFAULT 'agency',
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,

  // 2. groups
  `CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    group_name TEXT NOT NULL,
    departure_date TEXT,
    return_date TEXT,
    airline TEXT,
    total_seats INTEGER DEFAULT 0,
    available_seats INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open',
    makkah_hotel TEXT,
    madina_hotel TEXT,
    price_per_person REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS groups_agency_idx ON groups(agency_id);`,

  // 3. pilgrims
  `CREATE TABLE IF NOT EXISTS pilgrims (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    group_id TEXT,
    full_name TEXT NOT NULL,
    father_name TEXT,
    passport_no TEXT NOT NULL,
    passport_expiry TEXT,
    cnic TEXT,
    phone TEXT,
    photo_url TEXT,
    passport_scan_url TEXT,
    visa_status TEXT DEFAULT 'document_pending',
    ticket_status TEXT DEFAULT 'pending',
    hotel_status TEXT DEFAULT 'pending',
    payment_total REAL DEFAULT 0,
    payment_paid REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS pilgrims_agency_idx ON pilgrims(agency_id);`,
  `CREATE INDEX IF NOT EXISTS pilgrims_group_idx ON pilgrims(group_id);`,
  `CREATE INDEX IF NOT EXISTS pilgrims_passport_idx ON pilgrims(passport_no);`,

  // 4. tickets
  `CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    pnr TEXT NOT NULL,
    airline TEXT NOT NULL,
    sector TEXT NOT NULL,
    passenger_name TEXT NOT NULL,
    passport_no TEXT,
    purchase_rate REAL NOT NULL DEFAULT 0,
    sale_rate REAL NOT NULL DEFAULT 0,
    profit REAL GENERATED ALWAYS AS (sale_rate - purchase_rate),
    travel_date TEXT,
    return_date TEXT,
    status TEXT DEFAULT 'booked',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS tickets_agency_idx ON tickets(agency_id);`,
  `CREATE INDEX IF NOT EXISTS tickets_pnr_idx ON tickets(pnr);`,

  // 5. visas
  `CREATE TABLE IF NOT EXISTS visas (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    pilgrim_id TEXT,
    passport_no TEXT NOT NULL,
    visa_type TEXT DEFAULT 'umrah',
    submission_date TEXT,
    embassy TEXT,
    visa_number TEXT,
    issue_date TEXT,
    expiry_date TEXT,
    status TEXT DEFAULT 'document_pending',
    agent_fee REAL DEFAULT 0,
    embassy_fee REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS visas_agency_idx ON visas(agency_id);`,
  `CREATE INDEX IF NOT EXISTS visas_pilgrim_idx ON visas(pilgrim_id);`,

  // 6. hotels
  `CREATE TABLE IF NOT EXISTS hotels (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    city TEXT NOT NULL,
    hotel_name TEXT NOT NULL,
    per_night_rate REAL DEFAULT 0,
    contact TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS hotels_agency_idx ON hotels(agency_id);`,

  // 7. hotel_bookings
  `CREATE TABLE IF NOT EXISTS hotel_bookings (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    group_id TEXT,
    hotel_id TEXT,
    check_in TEXT,
    check_out TEXT,
    total_rooms INTEGER DEFAULT 0,
    total_beds INTEGER DEFAULT 0,
    total_cost REAL DEFAULT 0,
    advance_paid REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS hotel_bookings_agency_idx ON hotel_bookings(agency_id);`,
  `CREATE INDEX IF NOT EXISTS hotel_bookings_group_idx ON hotel_bookings(group_id);`,

  // 8. transport_bookings
  `CREATE TABLE IF NOT EXISTS transport_bookings (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    group_id TEXT,
    type TEXT,
    route TEXT,
    cost REAL DEFAULT 0,
    date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS transport_bookings_agency_idx ON transport_bookings(agency_id);`,
  `CREATE INDEX IF NOT EXISTS transport_bookings_group_idx ON transport_bookings(group_id);`,

  // 9. customers_ledger
  `CREATE TABLE IF NOT EXISTS customers_ledger (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    pilgrim_id TEXT,
    customer_name TEXT NOT NULL,
    phone TEXT,
    total_payable REAL DEFAULT 0,
    total_paid REAL DEFAULT 0,
    remaining REAL GENERATED ALWAYS AS (total_payable - total_paid),
    type TEXT DEFAULT 'individual',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS customers_ledger_agency_idx ON customers_ledger(agency_id);`,

  // 10. customer_transactions
  `CREATE TABLE IF NOT EXISTS customer_transactions (
    id TEXT PRIMARY KEY,
    ledger_id TEXT NOT NULL,
    agency_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    date TEXT NOT NULL,
    method TEXT DEFAULT 'cash',
    note TEXT,
    receipt_no TEXT UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS customer_tx_agency_idx ON customer_transactions(agency_id);`,
  `CREATE INDEX IF NOT EXISTS customer_tx_ledger_idx ON customer_transactions(ledger_id);`,

  // 11. suppliers_ledger
  `CREATE TABLE IF NOT EXISTS suppliers_ledger (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    supplier_type TEXT NOT NULL,
    total_payable REAL DEFAULT 0,
    total_paid REAL DEFAULT 0,
    remaining REAL GENERATED ALWAYS AS (total_payable - total_paid),
    phone TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS suppliers_ledger_agency_idx ON suppliers_ledger(agency_id);`,

  // 12. supplier_transactions
  `CREATE TABLE IF NOT EXISTS supplier_transactions (
    id TEXT PRIMARY KEY,
    supplier_id TEXT NOT NULL,
    agency_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    date TEXT NOT NULL,
    method TEXT DEFAULT 'bank',
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS supplier_tx_agency_idx ON supplier_transactions(agency_id);`,
  `CREATE INDEX IF NOT EXISTS supplier_tx_supplier_idx ON supplier_transactions(supplier_id);`,

  // 13. expenses
  `CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    date TEXT NOT NULL,
    description TEXT,
    bill_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS expenses_agency_idx ON expenses(agency_id);`,

  // 14. whatsapp_logs
  `CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    message_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'sent',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS whatsapp_logs_agency_idx ON whatsapp_logs(agency_id);`,

  // 15. notifications (AI Alerts)
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS notifications_agency_idx ON notifications(agency_id);`
];

async function migrate() {
  console.log('🚀 Pushing complete schema (15 tables & indexes) to Turso DB...');
  for (const sql of statements) {
    try {
      await client.execute(sql);
    } catch (err) {
      console.error('Error executing statement:', sql, err);
      process.exit(1);
    }
  }
  console.log('✅ All 15 tables and indexes successfully pushed to Turso Database!');
}

migrate();
