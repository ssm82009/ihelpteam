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
            sql: 'SELECT * FROM comments WHERE task_id = ? ORDER BY created_at ASC',
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
        const { task_id, content, type, media_data } = await request.json();

        if (!task_id || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = uuidv4();
        await db.execute({
            sql: 'INSERT INTO comments (id, task_id, content, type, media_data) VALUES (?, ?, ?, ?, ?)',
            args: [id, task_id, content || '', type, media_data || null],
        });

        return NextResponse.json({ id, task_id, content, type, media_data });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
