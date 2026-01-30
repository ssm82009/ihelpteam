import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const team_id = searchParams.get('team_id');

    if (!team_id) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    try {
        const result = await db.execute({
            sql: 'SELECT id, username, email, profile_image FROM users WHERE team_id = ?',
            args: [team_id],
        });
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        await db.execute({
            sql: 'DELETE FROM users WHERE id = ?',
            args: [user_id],
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting member:', error);
        return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
    }
}
