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
        console.log('Adding admin_id to teams table...');
        await db.execute('ALTER TABLE teams ADD COLUMN admin_id TEXT');
        console.log('Successfully added admin_id column.');

        // Attempt to backfill admin_id for existing teams
        // We assume the first user created for a team is the admin
        console.log('Attempting to backfill admin_id...');
        const teams = await db.execute('SELECT id FROM teams');
        for (const team of teams.rows) {
            const firstUser = await db.execute({
                sql: 'SELECT id FROM users WHERE team_id = ? LIMIT 1',
                args: [team.id]
            });
            if (firstUser.rows.length > 0) {
                await db.execute({
                    sql: 'UPDATE teams SET admin_id = ? WHERE id = ?',
                    args: [firstUser.rows[0].id, team.id]
                });
            }
        }
        console.log('Backfill complete.');

    } catch (e: any) {
        if (e.message.includes('duplicate column name')) {
            console.log('Column admin_id already exists.');
        } else {
            console.error('Error during migration:', e.message);
        }
    }
}

migrate();
