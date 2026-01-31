
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Force dynamic to ensure fresh counts
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'UserID required' }, { status: 400 });
    }

    try {
        const result = await db.execute({
            sql: `
                SELECT team_id, COUNT(*) as count 
                FROM pending_notifications 
                WHERE user_id = ? 
                GROUP BY team_id
            `,
            args: [userId]
        });

        // Transform to key-value map
        const counts: Record<string, number> = {};
        result.rows.forEach(row => {
            counts[row.team_id as string] = Number(row.count);
        });

        return NextResponse.json(counts);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
