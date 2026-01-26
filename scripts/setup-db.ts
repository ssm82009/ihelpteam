import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
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
    console.log('Initializing database schema...');

    const commands = [
        `CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      secret_code TEXT UNIQUE NOT NULL
    );`,

        `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      team_id TEXT NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );`,

        `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Plan', 'Execution', 'Completed', 'Review')),
      image_data TEXT,
      team_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );`,

        `CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      content TEXT,
      type TEXT NOT NULL CHECK(type IN ('text', 'image', 'voice')),
      media_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    );`
    ];

    for (const command of commands) {
        try {
            await db.execute(command);
            console.log('Executed:', command.split('\n')[0], '...');
        } catch (error) {
            console.error('Error executing command:', command);
            console.error(error);
        }
    }

    console.log('Database initialization complete.');
}

main();
