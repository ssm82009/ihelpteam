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
    console.log('Adding created_at column to users table...');
    try {
        await db.execute('ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
        console.log('Successfully added created_at column.');
    } catch (error: any) {
        if (error.message.includes('duplicate column name')) {
            console.log('Column created_at already exists.');
        } else {
            console.error('Error adding column:', error);
        }
    }
}

main();
