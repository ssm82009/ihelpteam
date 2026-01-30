import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { plan_type, subscription_end } = await request.json();
        const userId = params.id;

        // 1. Find the email for this user ID
        const userRes = await db.execute({
            sql: 'SELECT email FROM users WHERE id = ? LIMIT 1',
            args: [userId]
        });

        if (userRes.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const email = userRes.rows[0].email;

        // 2. Update all users with this email (across all teams)
        await db.execute({
            sql: 'UPDATE users SET plan_type = ?, subscription_end = ? WHERE email = ?',
            args: [plan_type, subscription_end, email]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = params.id;

        // 1. Find the email for this user ID
        const userRes = await db.execute({
            sql: 'SELECT email FROM users WHERE id = ? LIMIT 1',
            args: [userId]
        });

        if (userRes.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const email = userRes.rows[0].email;

        // 2. Delete everything related to this email across ALL teams
        // This is a broad delete since the user is being "banned/deleted" from the system
        await db.execute({ sql: 'DELETE FROM comments WHERE user_id IN (SELECT id FROM users WHERE email = ?)', args: [email] });
        await db.execute({ sql: 'DELETE FROM tasks WHERE user_id IN (SELECT id FROM users WHERE email = ?)', args: [email] });
        await db.execute({ sql: 'DELETE FROM users WHERE email = ?', args: [email] });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
