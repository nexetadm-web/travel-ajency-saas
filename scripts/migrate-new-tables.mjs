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
  // 16. passport_scans
  `CREATE TABLE IF NOT EXISTS passport_scans (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    full_name TEXT,
    father_name TEXT,
    passport_no TEXT,
    cnic TEXT,
    dob TEXT,
    expiry TEXT,
    place_of_birth TEXT,
    photo_url TEXT,
    raw_response TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS passport_scans_agency_idx ON passport_scans(agency_id);`,

  // 17. cash_book
  `CREATE TABLE IF NOT EXISTS cash_book (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    date TEXT NOT NULL,
    opening_balance REAL DEFAULT 0,
    type TEXT NOT NULL,
    category TEXT,
    amount REAL NOT NULL DEFAULT 0,
    method TEXT DEFAULT 'cash',
    description TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS cash_book_agency_idx ON cash_book(agency_id);`,
  `CREATE INDEX IF NOT EXISTS cash_book_date_idx ON cash_book(date);`,

  // 18. visa_cases
  `CREATE TABLE IF NOT EXISTS visa_cases (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    father_name TEXT,
    passport_no TEXT,
    phone TEXT,
    visa_type TEXT NOT NULL DEFAULT 'study',
    country TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'inquiry',
    total_fee REAL DEFAULT 0,
    paid REAL DEFAULT 0,
    remaining REAL GENERATED ALWAYS AS (total_fee - paid),
    university_name TEXT,
    employer_name TEXT,
    travel_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS visa_cases_agency_idx ON visa_cases(agency_id);`,
  `CREATE INDEX IF NOT EXISTS visa_cases_passport_idx ON visa_cases(passport_no);`,
  `CREATE INDEX IF NOT EXISTS visa_cases_status_idx ON visa_cases(status);`,

  // 19. visa_case_documents
  `CREATE TABLE IF NOT EXISTS visa_case_documents (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    doc_name TEXT NOT NULL,
    file_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS visa_case_docs_case_idx ON visa_case_documents(case_id);`,

  // 20. visa_case_timeline
  `CREATE TABLE IF NOT EXISTS visa_case_timeline (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    status_from TEXT,
    status_to TEXT,
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS visa_case_timeline_case_idx ON visa_case_timeline(case_id);`,

  // 21. tour_packages
  `CREATE TABLE IF NOT EXISTS tour_packages (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    package_name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'domestic',
    destination TEXT NOT NULL,
    duration_days INTEGER DEFAULT 1,
    price_per_person REAL DEFAULT 0,
    includes TEXT,
    max_seats INTEGER DEFAULT 20,
    departure_dates TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS tour_packages_agency_idx ON tour_packages(agency_id);`,

  // 22. tour_bookings
  `CREATE TABLE IF NOT EXISTS tour_bookings (
    id TEXT PRIMARY KEY,
    agency_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    phone TEXT,
    cnic TEXT,
    persons INTEGER DEFAULT 1,
    total_amount REAL DEFAULT 0,
    advance REAL DEFAULT 0,
    remaining REAL GENERATED ALWAYS AS (total_amount - advance),
    booking_date TEXT,
    travel_date TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS tour_bookings_agency_idx ON tour_bookings(agency_id);`,
  `CREATE INDEX IF NOT EXISTS tour_bookings_package_idx ON tour_bookings(package_id);`
];

async function migrate() {
  console.log('Migrating 7 new tables to Turso DB...');
  for (const sql of statements) {
    try {
      await client.execute(sql);
      console.log('✓ Executed:', sql.split('\n')[0].trim());
    } catch (e) {
      console.error('Error executing:', sql.split('\n')[0], e.message);
    }
  }
  console.log('✅ Migration of 7 new tables complete!');
}

migrate().catch(console.error);
