import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function resetAndSeed() {
    console.log('🧹 Cleaning database...');

    // Delete in correct order (respecting foreign keys)
    await db.execute('DELETE FROM comments');
    await db.execute('DELETE FROM tasks');
    await db.execute('DELETE FROM users');
    await db.execute('DELETE FROM teams');

    console.log('✓ Database cleaned');

    // Create test team
    const teamId = uuidv4();
    const secretCode = 'TEST123';

    await db.execute({
        sql: 'INSERT INTO teams (id, name, description, secret_code) VALUES (?, ?, ?, ?)',
        args: [teamId, 'Test Team', 'فريق تجريبي للاختبار', secretCode]
    });

    console.log(`✓ Created team: Test Team (Code: ${secretCode})`);

    // Create test user
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash('123456', 10);

    await db.execute({
        sql: 'INSERT INTO users (id, username, email, password, team_id) VALUES (?, ?, ?, ?, ?)',
        args: [userId, 'Admin User', 'admin@test.com', hashedPassword, teamId]
    });

    console.log('✓ Created user: admin@test.com / 123456');

    // Verify
    const users = await db.execute('SELECT id, username, email, team_id FROM users');
    console.log('\n📊 Users in database:');
    console.log(JSON.stringify(users.rows, null, 2));
}

resetAndSeed().catch(console.error);
