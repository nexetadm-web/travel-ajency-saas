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
