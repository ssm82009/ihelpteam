import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { secret_code } = await request.json();

        if (!secret_code) {
            return NextResponse.json({ error: 'Secret code is required' }, { status: 400 });
        }

        const result = await db.execute({
            sql: 'SELECT * FROM teams WHERE secret_code = ?',
            args: [secret_code.toUpperCase()],
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const team = result.rows[0];
        return NextResponse.json(team);
    } catch (error) {
        console.error('Error joining team:', error);
        return NextResponse.json({ error: 'Failed to join team' }, { status: 500 });
    }
}
