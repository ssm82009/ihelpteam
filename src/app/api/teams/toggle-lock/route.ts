
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { team_id, is_locked, user_id } = await request.json();

        if (!team_id || !user_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify admin
        const teamResult = await db.execute({
            sql: 'SELECT admin_id FROM teams WHERE id = ?',
            args: [team_id],
        });

        if (teamResult.rows.length === 0) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const team = teamResult.rows[0];
        if (team.admin_id !== user_id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update lock status
        await db.execute({
            sql: 'UPDATE teams SET is_locked = ? WHERE id = ?',
            args: [is_locked ? 1 : 0, team_id],
        });

        return NextResponse.json({ success: true, is_locked });
    } catch (error: any) {
        console.error('Error toggling team lock:', error);
        return NextResponse.json({ error: 'Failed to update team settings' }, { status: 500 });
    }
}
