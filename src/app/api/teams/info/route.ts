import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    try {
        const result = await db.execute({
            sql: 'SELECT id, name, description, secret_code, admin_id FROM teams WHERE id = ?',
            args: [id],
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching team info:', error);
        return NextResponse.json({ error: 'Failed to fetch team info' }, { status: 500 });
    }
}
