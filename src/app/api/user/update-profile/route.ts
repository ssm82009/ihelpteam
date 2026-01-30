import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request) {
    try {
        const { userId, profile_image } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        await db.execute({
            sql: 'UPDATE users SET profile_image = ? WHERE id = ?',
            args: [profile_image, userId]
        });

        // Also update tasks where this user is the creator or assigned
        await db.execute({
            sql: 'UPDATE tasks SET user_image = ? WHERE user_id = ?',
            args: [profile_image, userId]
        });

        await db.execute({
            sql: 'UPDATE tasks SET assigned_image = ? WHERE assigned_id = ?',
            args: [profile_image, userId]
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
