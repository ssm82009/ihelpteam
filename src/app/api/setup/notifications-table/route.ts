
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS pending_notifications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                task_id TEXT NOT NULL,
                team_id TEXT NOT NULL,
                comment_content TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        return NextResponse.json({ success: true, message: 'Table pending_notifications created' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
