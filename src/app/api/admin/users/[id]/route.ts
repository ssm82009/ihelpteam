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

        await db.execute({
            sql: 'UPDATE users SET plan_type = ?, subscription_end = ? WHERE id = ?',
            args: [plan_type, subscription_end, userId]
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

        // Note: Check if user has tasks/comments and delete them or let SQL cascade if configured.
        // For safety in this MVP, we delete comments then tasks then the user.
        await db.execute({ sql: 'DELETE FROM comments WHERE user_id = ?', args: [userId] });
        await db.execute({ sql: 'DELETE FROM tasks WHERE user_id = ?', args: [userId] });
        await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [userId] });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
