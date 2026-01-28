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

const db = createClient({
    url,
    authToken,
});

async function main() {
    console.log('Running migration: Adding plan columns to users table...');

    try {
        // Add plan_type column with default 'free'
        await db.execute('ALTER TABLE users ADD COLUMN plan_type TEXT DEFAULT "free"');
        console.log('Added column: plan_type');
    } catch (error: any) {
        if (error.message.includes('duplicate column name')) {
            console.log('Column plan_type already exists');
        } else {
            console.error('Error adding plan_type:', error);
        }
    }

    try {
        // Add subscription_end column
        await db.execute('ALTER TABLE users ADD COLUMN subscription_end DATETIME');
        console.log('Added column: subscription_end');
    } catch (error: any) {
        if (error.message.includes('duplicate column name')) {
            console.log('Column subscription_end already exists');
        } else {
            console.error('Error adding subscription_end:', error);
        }
    }

    // Update all current users to 'free' just in case the default didn't apply to existing rows
    try {
        await db.execute('UPDATE users SET plan_type = "free" WHERE plan_type IS NULL');
        console.log('Updated existing users to "free" plan.');
    } catch (error) {
        console.error('Error updating existing users:', error);
    }

    console.log('Migration complete.');
}

main();
