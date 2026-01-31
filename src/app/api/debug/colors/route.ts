
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const result = await db.execute('SELECT id, name, color_plan, color_execution, color_review, color_completed, color_notes FROM teams LIMIT 10');
        return NextResponse.json(result.rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
