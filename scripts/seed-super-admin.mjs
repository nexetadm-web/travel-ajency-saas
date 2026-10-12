import { createClient } from '@libsql/client/web';
import bcrypt from 'bcryptjs';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

async function seed() {
  console.log('Seeding Super Admin into Turso DB...');
  const email = 'mnuhbhatti333@gmail.com';

  const check = await client.execute({
    sql: 'SELECT * FROM agencies WHERE email = ? LIMIT 1',
    args: [email],
  });

  if (check.rows.length === 0) {
    const passwordHash = await bcrypt.hash('Admin@123456', 10);
    const id = crypto.randomUUID();

    await client.execute({
      sql: `INSERT INTO agencies (id, name, owner_name, email, phone, license_no, address, role, password_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        'Super Admin Portal',
        'M Nuh Bhatti',
        email,
        '+923000000000',
        'GOV-SA-001',
        'Islamabad, Pakistan',
        'super_admin',
        passwordHash,
      ],
    });

    console.log('✅ Super Admin seeded successfully in Turso DB:', email);
  } else {
    console.log('ℹ️ Super Admin already exists in Turso DB:', check.rows[0].email);
  }

  // Also seed a demo agency "Al-Haram Travels" as specified in FINAL TEST CHECKLIST
  const agencyEmail = 'alharam@travels.com';
  const checkAgency = await client.execute({
    sql: 'SELECT * FROM agencies WHERE email = ? LIMIT 1',
    args: [agencyEmail],
  });

  if (checkAgency.rows.length === 0) {
    const agencyHash = await bcrypt.hash('12345678', 10);
    const agencyId = crypto.randomUUID();

    await client.execute({
      sql: `INSERT INTO agencies (id, name, owner_name, email, phone, license_no, address, role, password_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        agencyId,
        'Al-Haram Travels & Tours',
        'Haji Abdul Rehman',
        agencyEmail,
        '+92 300 5556677',
        'DTS-LHR-2026',
        'Suite 4, Mall Road, Lahore, Pakistan',
        'agency',
        agencyHash,
      ],
    });

    console.log('✅ Demo Agency seeded successfully in Turso DB: Al-Haram Travels & Tours (email: alharam@travels.com, pass: 12345678)');
  } else {
    console.log('ℹ️ Demo Agency already exists in Turso DB:', checkAgency.rows[0].name);
  }
}

seed();
