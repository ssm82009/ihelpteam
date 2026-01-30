import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const task_id = searchParams.get('task_id');

    if (!task_id) {
        return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    try {
        const result = await db.execute({
            sql: `
                SELECT c.*, u.username, u.profile_image
                FROM comments c 
                LEFT JOIN users u ON c.user_id = u.id 
                WHERE c.task_id = ? 
                ORDER BY c.created_at ASC
            `,
            args: [task_id],
        });
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { task_id, user_id, content, type, media_data } = await request.json();

        if (!task_id || !user_id || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = uuidv4();
        const created_at = new Date().toISOString();

        await db.execute({
            sql: 'INSERT INTO comments (id, task_id, user_id, content, type, media_data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [id, task_id, user_id, content || '', type, media_data || null, created_at],
        });

        // Get username for the response
        const userRes = await db.execute({
            sql: 'SELECT username FROM users WHERE id = ?',
            args: [user_id]
        });
        const username = userRes.rows[0]?.username || 'User';

        return NextResponse.json({ id, task_id, user_id, username, content, type, media_data, created_at });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
