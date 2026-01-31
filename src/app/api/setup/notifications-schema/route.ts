
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Check if column exists or just try to add it. SQLite doesn't support IF EXISTS in ALTER TABLE easily for columns.
        // We'll wrap in try-catch.
        try {
            await db.execute('ALTER TABLE pending_notifications ADD COLUMN type TEXT DEFAULT "new_comment"');
        } catch (e: any) {
            // Likely already exists
            if (!e.message.includes('duplicate column name')) {
                console.log('Column might already exist or error:', e.message);
            }
        }
        return NextResponse.json({ success: true, message: 'Schema updated' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
