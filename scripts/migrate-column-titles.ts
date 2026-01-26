import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@libsql/client';

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

async function migrate() {
    try {
        console.log('Adding column titles to teams table...');
        await db.execute('ALTER TABLE teams ADD COLUMN title_plan TEXT DEFAULT "الخطة"');
        await db.execute('ALTER TABLE teams ADD COLUMN title_execution TEXT DEFAULT "التنفيذ"');
        await db.execute('ALTER TABLE teams ADD COLUMN title_completed TEXT DEFAULT "مكتمل"');
        await db.execute('ALTER TABLE teams ADD COLUMN title_review TEXT DEFAULT "مراجعة"');
        console.log('Successfully added title columns.');
    } catch (e: any) {
        console.error('Error during migration:', e.message);
    }
}

migrate();
