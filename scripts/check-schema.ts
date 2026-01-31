import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const db = createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    const result = await db.execute("SELECT * FROM users LIMIT 1");
    console.log("Columns:", Object.keys(result.rows[0] || {}));

    // Also check table info
    const info = await db.execute("PRAGMA table_info(users)");
    console.log("Table info:", info.rows);
}

main();
