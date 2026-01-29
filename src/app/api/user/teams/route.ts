import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const result = await db.execute({
            sql: 'SELECT t.id, t.name, t.secret_code, u.username, u.id as user_id FROM teams t JOIN users u ON t.id = u.team_id WHERE u.email = ?',
            args: [email],
        });

        return NextResponse.json({
            teams: result.rows
        });
    } catch (error: any) {
        console.error('Error fetching user teams:', error);
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}
