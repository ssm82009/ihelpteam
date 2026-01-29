import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const userResult = await db.execute({
            sql: 'SELECT id, username, email, team_id, plan_type, subscription_end FROM users WHERE email = ?',
            args: [email]
        });

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = userResult.rows[0];

        return NextResponse.json({
            user: {
                ...user,
                // Ensure correct types
                plan_type: user.plan_type || 'free',
            }
        });

    } catch (error: any) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: 'Failed to sync user data' }, { status: 500 });
    }
}
