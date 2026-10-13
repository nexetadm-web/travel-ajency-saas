import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql, type SQL } from 'drizzle-orm';

// 1. AGENCIES TABLE
export const agencies = sqliteTable('agencies', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  owner_name: text('owner_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  logo_url: text('logo_url'),
  address: text('address'),
  license_no: text('license_no'),
  role: text('role').notNull().default('agency'), // 'agency' | 'super_admin'
  password_hash: text('password_hash').notNull(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 2. GROUPS TABLE (Umrah / Hajj Groups)
export const groups = sqliteTable('groups', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  group_name: text('group_name').notNull(), // e.g. "Umrah Group 15 Dec 2026 - 40 Persons"
  departure_date: text('departure_date'),
  return_date: text('return_date'),
  airline: text('airline'),
  total_seats: integer('total_seats').default(0),
  available_seats: integer('available_seats').default(0),
  status: text('status').default('open'), // 'open' | 'closed' | 'departed' | 'completed'
  makkah_hotel: text('makkah_hotel'),
  madina_hotel: text('madina_hotel'),
  price_per_person: real('price_per_person').default(0),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('groups_agency_idx').on(table.agency_id),
}));

// 3. PILGRIMS TABLE
export const pilgrims = sqliteTable('pilgrims', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  group_id: text('group_id'),
  full_name: text('full_name').notNull(),
  father_name: text('father_name'),
  passport_no: text('passport_no').notNull(),
  passport_expiry: text('passport_expiry'),
  cnic: text('cnic'),
  phone: text('phone'),
  photo_url: text('photo_url'),
  passport_scan_url: text('passport_scan_url'),
  visa_status: text('visa_status').default('document_pending'), // 'document_pending' | 'in_embassy' | 'printed' | 'returned'
  ticket_status: text('ticket_status').default('pending'), // 'pending' | 'issued' | 'cancelled'
  hotel_status: text('hotel_status').default('pending'),
  payment_total: real('payment_total').default(0),
  payment_paid: real('payment_paid').default(0),
  sub_agent_id: text('sub_agent_id'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('pilgrims_agency_idx').on(table.agency_id),
  groupIdx: index('pilgrims_group_idx').on(table.group_id),
  passportIdx: index('pilgrims_passport_idx').on(table.passport_no),
}));

// 4. TICKETS TABLE
export const tickets = sqliteTable('tickets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  pnr: text('pnr').notNull(),
  airline: text('airline').notNull(),
  sector: text('sector').notNull(), // e.g. "LHE-JED-LHE"
  passenger_name: text('passenger_name').notNull(),
  passport_no: text('passport_no'),
  purchase_rate: real('purchase_rate').notNull().default(0),
  sale_rate: real('sale_rate').notNull().default(0),
  profit: real('profit').generatedAlwaysAs((): SQL => sql`sale_rate - purchase_rate`),
  travel_date: text('travel_date'),
  return_date: text('return_date'),
  status: text('status').default('booked'), // 'booked' | 'issued' | 'cancelled'
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('tickets_agency_idx').on(table.agency_id),
  pnrIdx: index('tickets_pnr_idx').on(table.pnr),
}));

// 5. VISAS TABLE
export const visas = sqliteTable('visas', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  pilgrim_id: text('pilgrim_id'),
  passport_no: text('passport_no').notNull(),
  visa_type: text('visa_type').default('umrah'),
  submission_date: text('submission_date'),
  embassy: text('embassy'),
  visa_number: text('visa_number'),
  issue_date: text('issue_date'),
  expiry_date: text('expiry_date'),
  status: text('status').default('document_pending'), // 'document_pending' | 'in_embassy' | 'printed' | 'returned'
  agent_fee: real('agent_fee').default(0),
  embassy_fee: real('embassy_fee').default(0),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('visas_agency_idx').on(table.agency_id),
  pilgrimIdx: index('visas_pilgrim_idx').on(table.pilgrim_id),
}));

// 6. HOTELS TABLE
export const hotels = sqliteTable('hotels', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  city: text('city').notNull(), // 'Makkah' | 'Madina'
  hotel_name: text('hotel_name').notNull(),
  per_night_rate: real('per_night_rate').default(0),
  contact: text('contact'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('hotels_agency_idx').on(table.agency_id),
}));

// 7. HOTEL BOOKINGS TABLE
export const hotel_bookings = sqliteTable('hotel_bookings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  group_id: text('group_id'),
  hotel_id: text('hotel_id'),
  check_in: text('check_in'),
  check_out: text('check_out'),
  total_rooms: integer('total_rooms').default(0),
  total_beds: integer('total_beds').default(0),
  total_cost: real('total_cost').default(0),
  advance_paid: real('advance_paid').default(0),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('hotel_bookings_agency_idx').on(table.agency_id),
  groupIdx: index('hotel_bookings_group_idx').on(table.group_id),
}));

// 8. TRANSPORT BOOKINGS TABLE
export const transport_bookings = sqliteTable('transport_bookings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  group_id: text('group_id'),
  type: text('type'), // 'Bus' | 'GMC' | 'Coaster' | 'Hiace' | 'Train'
  route: text('route'),
  cost: real('cost').default(0),
  date: text('date'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('transport_bookings_agency_idx').on(table.agency_id),
  groupIdx: index('transport_bookings_group_idx').on(table.group_id),
}));

// 9. CUSTOMERS LEDGER TABLE
export const customers_ledger = sqliteTable('customers_ledger', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  pilgrim_id: text('pilgrim_id'),
  customer_name: text('customer_name').notNull(),
  phone: text('phone'),
  total_payable: real('total_payable').default(0),
  total_paid: real('total_paid').default(0),
  remaining: real('remaining').generatedAlwaysAs((): SQL => sql`total_payable - total_paid`),
  type: text('type').default('individual'), // 'individual' | 'sub_agent' | 'group_leader'
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('customers_ledger_agency_idx').on(table.agency_id),
}));

// 10. CUSTOMER TRANSACTIONS TABLE
export const customer_transactions = sqliteTable('customer_transactions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  ledger_id: text('ledger_id').notNull(),
  agency_id: text('agency_id').notNull(),
  type: text('type').notNull(), // 'receive' | 'refund' | 'discount'
  amount: real('amount').notNull().default(0),
  date: text('date').notNull(),
  method: text('method').default('cash'), // 'cash' | 'easypaisa' | 'jazzcash' | 'bank'
  note: text('note'),
  receipt_no: text('receipt_no').unique(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('customer_tx_agency_idx').on(table.agency_id),
  ledgerIdx: index('customer_tx_ledger_idx').on(table.ledger_id),
}));

// 11. SUPPLIERS LEDGER TABLE
export const suppliers_ledger = sqliteTable('suppliers_ledger', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  supplier_name: text('supplier_name').notNull(), // e.g. "Saudi Hotel Al Safwa"
  supplier_type: text('supplier_type').notNull(), // 'airline' | 'hotel' | 'transport' | 'embassy' | 'other'
  total_payable: real('total_payable').default(0),
  total_paid: real('total_paid').default(0),
  remaining: real('remaining').generatedAlwaysAs((): SQL => sql`total_payable - total_paid`),
  phone: text('phone'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('suppliers_ledger_agency_idx').on(table.agency_id),
}));

// 12. SUPPLIER TRANSACTIONS TABLE
export const supplier_transactions = sqliteTable('supplier_transactions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  supplier_id: text('supplier_id').notNull(),
  agency_id: text('agency_id').notNull(),
  type: text('type').notNull(), // 'pay' | 'advance'
  amount: real('amount').notNull().default(0),
  date: text('date').notNull(),
  method: text('method').default('bank'),
  note: text('note'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('supplier_tx_agency_idx').on(table.agency_id),
  supplierIdx: index('supplier_tx_supplier_idx').on(table.supplier_id),
}));

// 13. EXPENSES TABLE
export const expenses = sqliteTable('expenses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  category: text('category').notNull(), // 'office_rent' | 'staff_salary' | 'marketing' | 'utility' | 'other'
  amount: real('amount').notNull().default(0),
  date: text('date').notNull(),
  description: text('description'),
  bill_url: text('bill_url'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('expenses_agency_idx').on(table.agency_id),
}));

// 14. WHATSAPP LOGS TABLE
export const whatsapp_logs = sqliteTable('whatsapp_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  recipient_phone: text('recipient_phone').notNull(),
  message_type: text('message_type').notNull(),
  message: text('message').notNull(),
  status: text('status').default('sent'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('whatsapp_logs_agency_idx').on(table.agency_id),
}));

// 15. NOTIFICATIONS TABLE (AI ALERTS)
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  type: text('type').notNull(), // 'passport_expiry' | 'group_seat' | 'payment_due' | 'system'
  title: text('title').notNull(),
  message: text('message').notNull(),
  is_read: integer('is_read').default(0),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('notifications_agency_idx').on(table.agency_id),
}));

// 16. PASSPORT SCANS TABLE (AI AUTO-FILL LOGS)
export const passport_scans = sqliteTable('passport_scans', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  full_name: text('full_name'),
  father_name: text('father_name'),
  passport_no: text('passport_no'),
  cnic: text('cnic'),
  dob: text('dob'),
  expiry: text('expiry'),
  place_of_birth: text('place_of_birth'),
  photo_url: text('photo_url'),
  raw_response: text('raw_response'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('passport_scans_agency_idx').on(table.agency_id),
}));

// 17. CASH BOOK TABLE (DAILY CASH IN/OUT & HAND CASH)
export const cash_book = sqliteTable('cash_book', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  date: text('date').notNull(),
  opening_balance: real('opening_balance').default(0),
  type: text('type').notNull(), // 'in' | 'out'
  category: text('category'),
  amount: real('amount').notNull().default(0),
  method: text('method').default('cash'), // 'cash' | 'bank' | 'easypaisa' | 'jazzcash'
  description: text('description'),
  created_by: text('created_by'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('cash_book_agency_idx').on(table.agency_id),
  dateIdx: index('cash_book_date_idx').on(table.date),
}));

// 18. VISA CASES TABLE (STUDY / VISIT / WORK / TOURIST VISA CONSULTANCY)
export const visa_cases = sqliteTable('visa_cases', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  client_name: text('client_name').notNull(),
  father_name: text('father_name'),
  passport_no: text('passport_no'),
  phone: text('phone'),
  visa_type: text('visa_type').notNull().default('study'), // 'study' | 'visit' | 'work' | 'tourist' | 'business' | 'family'
  country: text('country').notNull(), // 'UK' | 'Canada' | 'Dubai' | 'Schengen' | etc.
  status: text('status').notNull().default('inquiry'), // 'inquiry' | 'documents_pending' | 'applied' | 'in_embassy' | 'approved' | 'rejected' | 'passport_returned'
  total_fee: real('total_fee').default(0),
  paid: real('paid').default(0),
  remaining: real('remaining').generatedAlwaysAs((): SQL => sql`total_fee - paid`),
  university_name: text('university_name'),
  employer_name: text('employer_name'),
  travel_date: text('travel_date'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('visa_cases_agency_idx').on(table.agency_id),
  passportIdx: index('visa_cases_passport_idx').on(table.passport_no),
  statusIdx: index('visa_cases_status_idx').on(table.status),
}));

// 19. VISA CASE DOCUMENTS TABLE
export const visa_case_documents = sqliteTable('visa_case_documents', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  case_id: text('case_id').notNull(),
  doc_name: text('doc_name').notNull(), // e.g. 'Bank Statement', 'IELTS', 'Offer Letter'
  file_url: text('file_url'),
  status: text('status').default('pending'), // 'pending' | 'received' | 'verified'
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  caseIdx: index('visa_case_docs_case_idx').on(table.case_id),
}));

// 20. VISA CASE TIMELINE TABLE
export const visa_case_timeline = sqliteTable('visa_case_timeline', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  case_id: text('case_id').notNull(),
  status_from: text('status_from'),
  status_to: text('status_to'),
  note: text('note'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  caseIdx: index('visa_case_timeline_case_idx').on(table.case_id),
}));

// 21. TOUR PACKAGES TABLE (DOMESTIC & INTERNATIONAL)
export const tour_packages = sqliteTable('tour_packages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  package_name: text('package_name').notNull(), // e.g. 'Hunza 5 Days', 'Dubai 4 Nights'
  type: text('type').notNull().default('domestic'), // 'domestic' | 'international'
  destination: text('destination').notNull(),
  duration_days: integer('duration_days').default(1),
  price_per_person: real('price_per_person').default(0),
  includes: text('includes'), // e.g. 'Hotel,Jeep,Breakfast'
  max_seats: integer('max_seats').default(20),
  departure_dates: text('departure_dates'), // JSON array string
  status: text('status').default('active'), // 'active' | 'full'
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('tour_packages_agency_idx').on(table.agency_id),
}));

// 22. TOUR BOOKINGS TABLE
export const tour_bookings = sqliteTable('tour_bookings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agency_id: text('agency_id').notNull(),
  package_id: text('package_id').notNull(),
  client_name: text('client_name').notNull(),
  phone: text('phone'),
  cnic: text('cnic'),
  persons: integer('persons').default(1),
  total_amount: real('total_amount').default(0),
  advance: real('advance').default(0),
  remaining: real('remaining').generatedAlwaysAs((): SQL => sql`total_amount - advance`),
  booking_date: text('booking_date'),
  travel_date: text('travel_date'),
  status: text('status').default('confirmed'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('tour_bookings_agency_idx').on(table.agency_id),
  packageIdx: index('tour_bookings_package_idx').on(table.package_id),
}));

// 23. INSTALLMENT PLANS (QIST SYSTEM)
export const installmentPlans = sqliteTable('installment_plans', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agencyId: text('agency_id').notNull(),
  pilgrimId: text('pilgrim_id').notNull().references(() => pilgrims.id),
  groupId: text('group_id'),
  totalAmount: real('total_amount').notNull(),
  advancePaid: real('advance_paid').default(0),
  installmentsCount: integer('installments_count').notNull(),
  perInstallment: real('per_installment').notNull(),
  status: text('status').default('active'), // active, completed, overdue
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('installment_plans_agency_idx').on(table.agencyId),
  pilgrimIdx: index('installment_plans_pilgrim_idx').on(table.pilgrimId),
}));
export const installment_plans = installmentPlans;

// 24. INSTALLMENT PAYMENTS
export const installmentPayments = sqliteTable('installment_payments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  planId: text('plan_id').notNull().references(() => installmentPlans.id),
  agencyId: text('agency_id').notNull(),
  dueDate: text('due_date').notNull(), // DD-MM-YYYY
  paidDate: text('paid_date'),
  amount: real('amount').notNull(),
  status: text('status').default('pending'), // pending, paid, overdue
  method: text('method'), // cash, easypaisa, jazzcash, bank
  receiptNo: text('receipt_no'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  planIdx: index('installment_payments_plan_idx').on(table.planId),
  agencyIdx: index('installment_payments_agency_idx').on(table.agencyId),
}));
export const installment_payments = installmentPayments;

// 25. SUB AGENT / REFERRAL
export const subAgents = sqliteTable('sub_agents', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agencyId: text('agency_id').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  cnic: text('cnic'),
  city: text('city'),
  commissionType: text('commission_type').default('per_person'), // per_person, percent
  commissionValue: real('commission_value').default(5000), // 5000 Rs or 5%
  totalPilgrims: integer('total_pilgrims').default(0),
  totalEarned: real('total_earned').default(0),
  totalPaid: real('total_paid').default(0),
  remaining: real('remaining'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('sub_agents_agency_idx').on(table.agencyId),
}));
export const sub_agents = subAgents;

// 26. KIT INVENTORY ITEMS
export const inventoryItems = sqliteTable('inventory_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agencyId: text('agency_id').notNull(),
  itemName: text('item_name').notNull(), // Umrah Bag, Ihram, Dua Book, ID Card
  purchasePrice: real('purchase_price'),
  stockQty: integer('stock_qty').default(0),
  issuedQty: integer('issued_qty').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  agencyIdx: index('inventory_items_agency_idx').on(table.agencyId),
}));
export const inventory_items = inventoryItems;

// 27. INVENTORY ISSUES
export const inventoryIssues = sqliteTable('inventory_issues', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agencyId: text('agency_id').notNull(),
  groupId: text('group_id').references(() => groups.id),
  pilgrimId: text('pilgrim_id').notNull().references(() => pilgrims.id),
  itemId: text('item_id').notNull().references(() => inventoryItems.id),
  issuedDate: text('issued_date').default(sql`CURRENT_TIMESTAMP`),
  returned: integer('returned').default(0),
}, (table) => ({
  agencyIdx: index('inventory_issues_agency_idx').on(table.agencyId),
  pilgrimIdx: index('inventory_issues_pilgrim_idx').on(table.pilgrimId),
  itemIdx: index('inventory_issues_item_idx').on(table.itemId),
}));
export const inventory_issues = inventoryIssues;

