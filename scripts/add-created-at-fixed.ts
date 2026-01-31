import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({ url: url!, authToken: authToken! });

async function main() {
    console.log('Adding created_at column without default...');
    try {
        await db.execute('ALTER TABLE users ADD COLUMN created_at DATETIME');
        console.log('Successfully added created_at column.');
        await db.execute('UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL');
        console.log('Updated existing rows with current timestamp.');
    } catch (error: any) {
        console.error('Error:', error);
    }
}

main();
