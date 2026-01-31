import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { email, team_id } = await request.json();

        if (!email || !team_id) {
            return NextResponse.json({ error: 'Email and Team ID are required' }, { status: 400 });
        }

        // 1. Get user and team info
        const result = await db.execute({
            sql: 'SELECT u.*, t.name as team_name, t.secret_code, t.admin_id FROM users u JOIN teams t ON u.team_id = t.id WHERE u.email = ? AND u.team_id = ?',
            args: [email, team_id],
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found in this team' }, { status: 404 });
        }

        const user = result.rows[0];

        const fullTeamResult = await db.execute({
            sql: 'SELECT * FROM teams WHERE id = ?',
            args: [user.team_id as string],
        });
        const team = fullTeamResult.rows[0];

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                team_id: user.team_id,
                plan_type: user.plan_type || 'free',
                subscription_end: user.subscription_end
            },
            team
        });
    } catch (error: any) {
        console.error('Error switching team:', error);
        return NextResponse.json({ error: 'Failed to switch team' }, { status: 500 });
    }
}
