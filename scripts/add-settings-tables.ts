import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
    process.exit(1);
}

const db = createClient({ url, authToken });

async function main() {
    console.log('Creating settings and plans tables...');

    try {
        // 1. Subscription Plans Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS subscription_plans (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                max_teams INTEGER NOT NULL,
                max_members INTEGER NOT NULL,
                price REAL NOT NULL,
                duration TEXT NOT NULL,
                is_default INTEGER DEFAULT 0
            )
        `);

        // Seed default plans if empty
        const plansCheck = await db.execute('SELECT COUNT(*) as count FROM subscription_plans');
        if (plansCheck.rows[0].count === 0) {
            await db.execute("INSERT INTO subscription_plans (id, name, max_teams, max_members, price, duration, is_default) VALUES ('free', 'الباقة المجانية', 1, 5, 0, 'unlimited', 1)");
            await db.execute("INSERT INTO subscription_plans (id, name, max_teams, max_members, price, duration, is_default) VALUES ('pro', 'اشتراك مساعد الفريق - سنوي', 10, 10, 199, '1 year', 0)");
            console.log('Seeded default plans.');
        }

        // 2. Site Settings Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS site_settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `);

        // 3. Payment Gateway Table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS payment_settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `);

        console.log('Database tables established.');
    } catch (error) {
        console.error('Error in migration:', error);
    }
}

main();
